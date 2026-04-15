import './Loader.css'

const Loader = ({ text = "Загрузка..." }) => (
  <div className="hockey-loader">
    <div className="hockey-loader__ice">
      <div className="hockey-loader__puck"></div>
    </div>
    {text && <span className="hockey-loader__text">{text}</span>}
  </div>
);

export default Loader;
