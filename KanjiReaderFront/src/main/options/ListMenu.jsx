import React from 'react';
import './ListMenu.css'; 
import ArchitectButton from '../../comp/buttons/ArchitectButton';

const ListMenu = ({ getter, setter, isActive, isPicked, title, collec, back, secondary }) => {
  const animationClass = isActive 
    ? (isPicked ? 'slide-in-blurred-right' : 'slide-out-blurred-right') 
    : 'noMore';

  return (
    <div className={`${animationClass} list-menu-container`}>
      <h1>{title}</h1>

      <div className="list-card">
        <ul className="list-menu-list">
          {collec.map((e, index) => (
            <li key={index} className="list-menu-item">
              
              <a
                onClick={() => setter(index)}
                className={`list-menu-link ${getter === index ? 'selected' : ''}`}
              >
                <div className="item-left-side">
                  {/* Римские цифры теперь внутри ссылки для лучшего ховера */}
                  <span className={`list-menu-number ${getter === index ? 'selected' : ''}`}>
                    {String.fromCharCode(0x2160 + index)}
                  </span>
                  <span className="item-title">{e.title}</span>
                </div>

                <div className="item-right-side">
                  {secondary && secondary[index] > 0 && (
                    <span className="secondary" title="Percent of correct readings in last five attempts">
                      {secondary[index]} <span className="percent">%</span>
                    </span>
                  )}
                  <span className="list-menu-indicator">此</span>
                </div>

              </a>
            </li>
          ))}
        </ul>
      </div>

      <ArchitectButton className="list-menu-button" onClick={back} label={"帰 る"}></ArchitectButton>
    </div>
  );
}

export default ListMenu;