
import { Loading } from 'react-dsgov';
import styles from './OverlayLoading.module.scss';
import useLoadingState from '../../state/hooks/useLoadingState';

const OverlayLoading : React.FC = () => {
    const [loading, ] = useLoadingState();

    return (
        <> 
            {loading && <div className={styles.overlay}>
                <div className={styles.loading}><Loading /></div>
            </div>}
        </>
        
    )
}

export default OverlayLoading;