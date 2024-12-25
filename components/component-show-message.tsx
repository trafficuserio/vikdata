import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';

const MySwal = withReactContent(Swal);

interface Props {
    content?: string;
    className?: string;
}

export const ShowMessageError = ({ content, className }: Props): void => {
    MySwal.fire({
        title: content,
        toast: true,
        position: 'top',
        icon: 'error',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: false,
        width: 600,
    });
};

export const ShowMessageInfo = ({ content, className }: Props): void => {
    MySwal.fire({
        title: content,
        toast: true,
        position: 'top',
        icon: 'info',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: false,
        width: 600,
    });
};

export const ShowMessageSuccess = ({ content, className }: Props): void => {
    MySwal.fire({
        title: content,
        toast: true,
        position: 'top',
        icon: 'success',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: false,
        width: 600,
    });
};
