import { describe, it, expect, beforeEach } from "vitest";
import { useCollectionsStore } from "./collections.store";

beforeEach(() => {
  useCollectionsStore.setState({ collections: [] });
});

describe("collections store", () => {
  it("adds a collection", () => {
    useCollectionsStore.getState().addCollection("My API");
    const { collections } = useCollectionsStore.getState();
    expect(collections).toHaveLength(1);
    expect(collections[0].name).toBe("My API");
  });

  it("removes a collection", () => {
    useCollectionsStore.getState().addCollection("To Delete");
    const { collections } = useCollectionsStore.getState();
    useCollectionsStore.getState().removeCollection(collections[0].id);
    expect(useCollectionsStore.getState().collections).toHaveLength(0);
  });

  it("adds a request to a collection", () => {
    useCollectionsStore.getState().addCollection("API");
    const col = useCollectionsStore.getState().collections[0];
    useCollectionsStore.getState().addRequest(col.id, {
      name: "Get Users",
      method: "GET",
      url: "/users",
      headers: [],
      params: [],
      body: "",
      bodyType: "none",
      auth: { type: "none" },
    });
    const items = useCollectionsStore.getState().collections[0].items;
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe("Get Users");
  });

  it("adds a folder and toggles it", () => {
    useCollectionsStore.getState().addCollection("API");
    const col = useCollectionsStore.getState().collections[0];
    useCollectionsStore.getState().addFolder(col.id, "Auth");
    const item = useCollectionsStore.getState().collections[0].items[0];
    expect(item.type).toBe("folder");
    expect(item.isOpen).toBe(true);
    useCollectionsStore.getState().toggleFolder(col.id, item.id);
    expect(useCollectionsStore.getState().collections[0].items[0].isOpen).toBe(
      false,
    );
  });
});
