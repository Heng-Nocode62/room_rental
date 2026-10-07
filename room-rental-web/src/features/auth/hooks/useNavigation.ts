import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { mapNavigation } from "../utils/navigationMapper";


export function useNavigation() {
  const { data: user, isLoading, error } = useCurrentUser();

  return {
    navigation: mapNavigation(user?.navigation ?? []),
    isLoading,
    error,
  };
}