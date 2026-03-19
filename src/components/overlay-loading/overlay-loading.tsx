import { Loading } from "react-dsgov";
import styles from "./overlay-loading.module.scss";
import useLoadingState from "../../state/hooks/useLoadingState";

export function OverlayLoading() {
  const [loading] = useLoadingState();

  return (
    <>
      {loading && (
        <div className={styles.overlay}>
          <div className={styles.loading}>
            <Loading />
          </div>
        </div>
      )}
    </>
  );
};
