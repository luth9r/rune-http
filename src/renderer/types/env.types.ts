export interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
  isActive: boolean;
}

export interface EnvStore {
  environments: Environment[];
  activeEnvId: string | null;
}
