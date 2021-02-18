import { Modal, Button } from "antd";
import { useAuth0 } from '@auth0/auth0-react';

const ModalWarningUser = ({visible, close}) => {
  const {user} = useAuth0();
  return (
     <Modal
       width={600}
       okText="Close"
       visible={visible}
       footer={<Button onClick={e => close()}>Close</Button>}
       closable={false}
     >
         <div className="warning-modal-user">
             <p>
                 {user?.email_verified === false && <b>Click on the link we sent in your email to verify your email address.</b>}
                 We will review your sign-up request{ user?.email_verified === false && " as soon as you verify your email address" }. Please, allow for 1 business day.
             </p>
         </div>
     </Modal>
  )
}

export default ModalWarningUser;
