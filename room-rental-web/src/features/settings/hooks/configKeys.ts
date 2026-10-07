export const configKeys = {
  all: ["config"] as const,

  global: () => [...configKeys.all, "global"] as const,

  user: () => [...configKeys.all, "user"] as const,

  cardText: () => [...configKeys.all, "card-text"] as const,

  rootUser: () => [...configKeys.all, "root-user"] as const,

  cms: () => [...configKeys.all, "cms"] as const,
};
