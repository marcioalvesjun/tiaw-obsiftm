import { useRecoilState } from "recoil";
import { breadcrumbs } from "../atom";

export const useBreadcrumbs = () => {
  return useRecoilState(breadcrumbs);
};
