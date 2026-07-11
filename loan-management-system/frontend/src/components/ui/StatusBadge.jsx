import statusClassName from '../../utils/status';

const StatusBadge = ({ status }) => {
  return <span className={`status-badge status-${statusClassName(status)}`}>{status}</span>;
};

export default StatusBadge;
