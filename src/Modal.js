import './Modal.css';

export default function Modal(props) {
  return (
    <div className='modal'>
      <div className="modal-content">
        <span className="close" onClick={props.closeModal}>&times;</span>
        {props.children}
      </div>
    </div>);
}