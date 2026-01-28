import "../css/app.css";
import "../css/ListMenu.css";

const ListMenu = ({ getter, setter, isPicked, title, collec, back, secondary }) => {
  return (
    <div className={`${isPicked ? 'slide-in-blurred-right' : 'slide-out-blurred-right'} list-menu-container`}>
      <h1>{title}</h1>

      <div className="card">
        <ol className="list-menu-list">
          {collec.map((e, index) => (
            <li key={index} className="list-menu-item">
              <span className={`list-menu-number ${getter === index ? 'selected' : ''}`}>
                {String.fromCharCode(0x2160 + index)}
              </span>

              <a
                onClick={() => setter(index)}
                className={`list-menu-link ${getter === index ? 'selected' : ''}`}
              >
                <span>{e.title}</span>

                {secondary && secondary[index] > 0 &&
                  <span className="secondary" title="Percent of correct readings in last five attempts">
                    {secondary[index]} <span className="percent">%</span>
                  </span>}

                <span className="list-menu-indicator">
                  此
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
      <button className="list-menu-button" onClick={() => back(!isPicked)}>帰</button>
    </div>
  );
}

export default ListMenu;