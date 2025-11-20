import "../css/app.css";

const ListMenu = ({ getter, setter, isPicked, title, collec, back }) => {

  return (

    <div className={isPicked ? 'slide-in-blurred-right' : 'slide-out-blurred-right'}
      style={{
        position: 'absolute',
        width: '50%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
      <h1>{title}</h1>

      <div className="card">

        <ol style={{
          listStyle: "none",
          paddingLeft: "0",
          textAlign: "left",
          width: "400px",
          margin: 0
        }}>

          {collec.map((e, index) => (
            <li key={index} style={{
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              position: "relative"
            }}>

              <span style={{
                marginRight: "12px",
                color: getter === index ? "#c00c75" : "#666",
                fontWeight: getter === index ? "600" : "400",
                minWidth: "20px",
                textAlign: "right"
              }}>
                {String.fromCharCode(0x2160 + index)}
              </span>

              <a
                onClick={() => setter(index)}
                style={{
                  opacity: getter === index ? "1" : "0.8",
                  color: getter === index ? "#c00c75" : "",
                  cursor: "pointer",
                  textDecoration: "none",
                  flex: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span>{e.title}</span>

                <span style={{
                  visibility: getter === index ? "visible" : "hidden",
                  color: "#c00c75",
                  fontWeight: "bold",
                  width: "20px",
                  textAlign: "center"
                }}>
                  此
                </span>
              </a>
            </li>
          ))}
        </ol>

      </div>
      <button onClick={() => back(!isPicked)}>Back</button>

    </div>
  );
}

export default ListMenu
