import { describe, it, expect, beforeEach } from "vitest";
import { useEnvStore } from "./env.store";

beforeEach(() => {
  useEnvStore.setState({ environments: [], activeEnvId: null });
});

describe("env store", () => {
  it("adds an environment", () => {
    useEnvStore.getState().addEnvironment("Staging");
    const { environments } = useEnvStore.getState();
    expect(environments).toHaveLength(1);
    expect(environments[0].name).toBe("Staging");
    expect(environments[0].variables).toEqual({});
  });

  it("removes an environment", () => {
    useEnvStore.getState().addEnvironment("To Delete");
    const { environments } = useEnvStore.getState();
    useEnvStore.getState().removeEnvironment(environments[0].id);
    expect(useEnvStore.getState().environments).toHaveLength(0);
  });

  it("clears activeEnvId when active env is removed", () => {
    useEnvStore.getState().addEnvironment("Local");
    const { environments } = useEnvStore.getState();
    useEnvStore.getState().setActiveEnv(environments[0].id);
    useEnvStore.getState().removeEnvironment(environments[0].id);
    expect(useEnvStore.getState().activeEnvId).toBeNull();
  });

  it("updates environment variables", () => {
    useEnvStore.getState().addEnvironment("Local");
    const { environments } = useEnvStore.getState();
    useEnvStore.getState().updateEnvironment(environments[0].id, {
      BASE_URL: "http://localhost:3000",
      TOKEN: "secret",
    });
    const updated = useEnvStore.getState().environments[0];
    expect(updated.variables.BASE_URL).toBe("http://localhost:3000");
    expect(updated.variables.TOKEN).toBe("secret");
  });

  it("renames an environment", () => {
    useEnvStore.getState().addEnvironment("Old Name");
    const { environments } = useEnvStore.getState();
    useEnvStore.getState().renameEnvironment(environments[0].id, "New Name");
    expect(useEnvStore.getState().environments[0].name).toBe("New Name");
  });

  it("sets active environment", () => {
    useEnvStore.getState().addEnvironment("Local");
    const { environments } = useEnvStore.getState();
    useEnvStore.getState().setActiveEnv(environments[0].id);
    expect(useEnvStore.getState().activeEnvId).toBe(environments[0].id);
  });

  it("getActiveVariables returns variables of active env", () => {
    useEnvStore.getState().addEnvironment("Local");
    const { environments } = useEnvStore.getState();
    useEnvStore.getState().updateEnvironment(environments[0].id, {
      BASE_URL: "http://localhost:3000",
    });
    useEnvStore.getState().setActiveEnv(environments[0].id);
    const vars = useEnvStore.getState().getActiveVariables();
    expect(vars.BASE_URL).toBe("http://localhost:3000");
  });

  it("getActiveVariables returns empty object if no active env", () => {
    const vars = useEnvStore.getState().getActiveVariables();
    expect(vars).toEqual({});
  });
});
