import { Modal } from 'antd';

interface LayoutModalProps {
   open: boolean;
   onClose: () => void;
}

export default function LayoutModal({ open, onClose }: LayoutModalProps) {
   return (
      <Modal
         title="Vehicle Layout Management"
         open={open}
         onCancel={onClose}
         footer={null}
         width={800}
         zIndex={10000}
         centered
      >
         {/* Nội dung quản lý layout xe */}
      </Modal>
   );
}
