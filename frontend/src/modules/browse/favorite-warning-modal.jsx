import { Modal, Button } from "antd";
import { useAuth0 } from '@auth0/auth0-react';

const FavoriteWarningModal = ({visible, close}) => {
    const {user} = useAuth0();
    return (
        <Modal
          width={600}
          okText="Close"
          visible={visible}
          className="event-warning-modal"
          footer={<Button onClick={e => close()}>Close</Button>}
          closable={false}
        >
          <div className="submitted">
            <h2>Pending approval</h2>
            <p>
              You can add a <strong>favorite</strong> once your account is approved.
              We will review your account shortly.
              {user?.email_verified === false && <span><br />
              Meanwhile please confirm your email.
              <br />
              <small>Registrations with unconfirmed emails will not be approved</small></span>}
            </p>
          </div>
        </Modal>
    );
}

export default FavoriteWarningModal;
