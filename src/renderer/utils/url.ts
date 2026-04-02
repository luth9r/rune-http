import { v4 as uuid } from "uuid";
import type { KeyValuePair } from "@/types";

export function parseUrlParams(url: string): KeyValuePair[] {
  try {
    const search = url.split("?")[1];
    if (!search) return [];

    const params = new URLSearchParams(search);
    const result: KeyValuePair[] = [];
    params.forEach((value, key) => {
      result.push({
        id: uuid(),
        key,
        value,
        enabled: true,
        type: "text",
      });
    });
    return result;
  } catch {
    return [];
  }
}

export function updateUrlWithParams(
  url: string,
  params: KeyValuePair[]
): string {
  const [baseUrl] = url.split("?");
  const searchParams = new URLSearchParams();

  params.forEach((p) => {
    if (p.enabled && p.key) {
      searchParams.append(p.key, p.value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
