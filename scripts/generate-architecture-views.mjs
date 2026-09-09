import { readFileSync, writeFileSync } from "node:fs";
import { format } from "prettier";

const MODEL_PATH = "architecture/sgps-model.json";
const VIEWS_PATH = "architecture/derived-views.json";

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function relationshipIds(model, { types, entityIds } = {}) {
  return sorted(
    model.relationships
      .filter((relationship) => {
        if (types && !types.has(relationship.type)) return false;
        if (
          entityIds &&
          (!entityIds.has(relationship.from) || !entityIds.has(relationship.to))
        ) {
          return false;
        }
        return true;
      })
      .map((relationship) => relationship.id),
  );
}

function entityIdsForKinds(model, kinds) {
  return sorted(
    model.entities
      .filter((entity) => kinds.has(entity.kind))
      .map((entity) => entity.id),
  );
}

export function deriveArchitectureViews(model) {
  const views = [];

  let entityIds = new Set(
    entityIdsForKinds(
      model,
      new Set(["Portfolio", "Domain", "System", "ExternalDependency"]),
    ),
  );
  views.push({
    id: "portfolio-landscape",
    title: "Portfolio Landscape",
    entityIds: sorted(entityIds),
    relationshipIds: relationshipIds(model, { entityIds }),
  });

  entityIds = new Set([
    "system.sgps-marketing",
    ...entityIdsForKinds(
      model,
      new Set([
        "Component",
        "DataResource",
        "InfrastructureResource",
        "ExternalDependency",
        "Deployment",
      ]),
    ),
  ]);
  views.push({
    id: "system-context",
    title: "System Context",
    entityIds: sorted(entityIds),
    relationshipIds: relationshipIds(model, { entityIds }),
  });

  entityIds = new Set([
    "system.sgps-marketing",
    ...entityIdsForKinds(model, new Set(["Component", "DataResource"])),
  ]);
  views.push({
    id: "component",
    title: "Container / Component",
    entityIds: sorted(entityIds),
    relationshipIds: relationshipIds(model, { entityIds }),
  });

  const dependencyRelationships = model.relationships.filter(
    (relationship) => relationship.type === "depends_on",
  );
  entityIds = new Set(
    dependencyRelationships.flatMap((relationship) => [
      relationship.from,
      relationship.to,
    ]),
  );
  views.push({
    id: "dependency",
    title: "Dependency",
    entityIds: sorted(entityIds),
    relationshipIds: sorted(
      dependencyRelationships.map((relationship) => relationship.id),
    ),
  });

  const dataRelationships = model.relationships.filter((relationship) =>
    new Set(["reads", "validates"]).has(relationship.type),
  );
  entityIds = new Set(entityIdsForKinds(model, new Set(["DataResource"])));
  for (const relationship of dataRelationships) {
    entityIds.add(relationship.from);
    entityIds.add(relationship.to);
  }
  views.push({
    id: "data-flow",
    title: "Data Flow",
    entityIds: sorted(entityIds),
    relationshipIds: sorted(
      dataRelationships.map((relationship) => relationship.id),
    ),
  });

  entityIds = new Set(
    entityIdsForKinds(model, new Set(["Deployment", "InfrastructureResource"])),
  );
  for (const relationship of model.relationships) {
    if (
      new Set(["deploys_to", "depends_on"]).has(relationship.type) &&
      (entityIds.has(relationship.from) || entityIds.has(relationship.to))
    ) {
      entityIds.add(relationship.from);
      entityIds.add(relationship.to);
    }
  }
  views.push({
    id: "deployment",
    title: "Deployment",
    entityIds: sorted(entityIds),
    relationshipIds: relationshipIds(model, {
      types: new Set(["deploys_to", "depends_on"]),
      entityIds,
    }),
  });

  entityIds = new Set(
    model.entities
      .filter((entity) => Boolean(entity.trustBoundary))
      .map((entity) => entity.id),
  );
  views.push({
    id: "security-trust",
    title: "Security / Trust",
    entityIds: sorted(entityIds),
    relationshipIds: relationshipIds(model, { entityIds }),
  });

  const owners = new Map();
  for (const entity of model.entities) {
    if (!entity.owner) continue;
    const ids = owners.get(entity.owner) ?? [];
    ids.push(entity.id);
    owners.set(entity.owner, ids);
  }
  views.push({
    id: "ownership",
    title: "Ownership",
    owners: Object.fromEntries(
      sorted(owners.keys()).map((owner) => [owner, sorted(owners.get(owner))]),
    ),
  });

  return {
    schemaVersion: "sgps.architecture.views/v1alpha1",
    sourceModel: MODEL_PATH,
    sourceModelLastVerified: model.lastVerified,
    invariant: model.invariant,
    views,
  };
}

async function renderedViews() {
  const model = JSON.parse(readFileSync(MODEL_PATH, "utf8"));
  const json = `${JSON.stringify(deriveArchitectureViews(model), null, 2)}\n`;
  return format(json, { filepath: VIEWS_PATH });
}

if (process.argv[1]?.endsWith("generate-architecture-views.mjs")) {
  const rendered = await renderedViews();
  if (process.argv.includes("--check")) {
    const committed = readFileSync(VIEWS_PATH, "utf8");
    if (committed !== rendered) {
      console.error(
        `${VIEWS_PATH} is stale. Run: node scripts/generate-architecture-views.mjs`,
      );
      process.exit(1);
    }
  } else {
    writeFileSync(VIEWS_PATH, rendered);
  }
}
