import * as Constants from "../constants";

type SubgraphError = {
  message?: string;
};

type SubgraphEnvelope<T> = {
  data?: T;
  errors?: SubgraphError[];
};

export type SubgraphMeta = {
  _meta?: {
    block?: {
      timestamp?: number;
    };
  };
};

export async function fetchSubgraph<T>(query: string): Promise<T> {
  const response = await fetch(Constants.SUBGRAPH_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  let json: SubgraphEnvelope<T>;
  try {
    json = await response.json();
  } catch (error) {
    throw new Error("Subgraph response was not valid JSON");
  }

  if (!response.ok) {
    throw new Error(`Subgraph request failed with status ${response.status}`);
  }

  if (json.errors?.length) {
    const errorMessage = json.errors
      .map((entry) => entry.message || "Unknown subgraph error")
      .join("; ");
    throw new Error(errorMessage);
  }

  if (typeof json.data === "undefined") {
    throw new Error("Subgraph response did not include data");
  }

  return json.data;
}

export function isSubgraphDelayed(timestamp?: number) {
  if (typeof timestamp !== "number") {
    return false;
  }

  const currentTimestamp = Math.round(Date.now() / 1000);
  return (
    currentTimestamp - timestamp > Constants.SUBGRAPH_DELAY_TOLERANCE_MS
  );
}
