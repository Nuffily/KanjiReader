export function toDark() {
  document.body.style.backgroundColor = '#242424';
  document.body.style.color = '#f6f1f8ec';
  root.style.setProperty('--background-color', '#242424');

  root.style.setProperty('--text-color', '#f6f1f8ec');
  root.style.setProperty('--red-color', '#c00c75');
  root.style.setProperty('--redder-color', '#fa0092');

  root.style.setProperty('--second-back', '#333');
  root.style.setProperty('--list-gradient', 'linear-gradient(145deg, #242424, #1a1a1a)');

  root.style.setProperty('--incorrect-text', 'rgba(253, 220, 220, 0.87)');
  root.style.setProperty('--correct-text', 'rgba(220, 253, 223, 0.87)');

  root.style.setProperty('--incorrect-back', '#402424');
  root.style.setProperty('--correct-back', '#244424');
  root.style.setProperty('--neutural-back', '#242430');

  root.style.setProperty('--result-border', '#374151');
  root.style.setProperty('--item-correct', '#1a2e1a');
  root.style.setProperty('--item-incorrect', '#2e1a1a');

  root.style.setProperty('--text-correct', '#4ade80');
  root.style.setProperty('--text-incorrect', '#f87171');

  root.style.setProperty('--button-color', '#1f1f1f');
  root.style.setProperty('--button-text', 'rgba(221, 215, 219, 0.445)');
}

export function toLight() {
  document.body.style.backgroundColor = '#FDF5D7';
  document.body.style.color = '#333333';
  root.style.setProperty('--background-color', '#FDF5D7');

  root.style.setProperty('--text-color', '#333333');
  root.style.setProperty('--red-color', '#c50404');
  root.style.setProperty('--redder-color', '#ff2f2f');

  root.style.setProperty('--second-back', '#dfd8c0');
  root.style.setProperty('--list-gradient', 'linear-gradient(145deg, #e6e2d6, #e7dcb1)');

  root.style.setProperty('--incorrect-text', '#312c2c');
  root.style.setProperty('--correct-text', '#363d38');

  root.style.setProperty('--incorrect-back', '#f3d9cf');
  root.style.setProperty('--correct-back', '#e2fcca');
  root.style.setProperty('--neutural-back', '#e6e0cc');

  root.style.setProperty('--result-border', '#9c998d00');
  root.style.setProperty('--item-correct', '#b5fab5');
  root.style.setProperty('--item-incorrect', '#e4afaf');

  root.style.setProperty('--text-correct', '#395a39');
  root.style.setProperty('--text-incorrect', '#533434');

  root.style.setProperty('--button-color', '#dfd8c0');
  root.style.setProperty('--button-text', 'rgba(41, 41, 41, 0.69)');

}


