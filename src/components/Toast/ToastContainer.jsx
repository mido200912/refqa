import { useToast } from '../../utils/toast';

export default function ToastContainer() {
    const toasts = useToast();

    return (
        <div className="toast-container">
            {toasts.map(t => (
                <div key={t.id} className={`toast ${t.type}`}>
                    <span>
                        {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}
                    </span>
                    {t.msg}
                </div>
            ))}
        </div>
    );
}
