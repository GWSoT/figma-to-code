import { queryOptions } from "@tanstack/react-query";
import { getFigmaAccountsFn } from "~/fn/figma-accounts";

export const getFigmaAccountsQuery = () =>
  queryOptions({
    queryKey: ["figma-accounts"],
    queryFn: () => getFigmaAccountsFn(),
  });
