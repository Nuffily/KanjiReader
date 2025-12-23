import "../css/app.css";
import "../css/ProfileMenu.css"
import { useRef } from 'react';

const CLIENT_ID = "Ov23liOda3qqFTKeKow1";

function questIcon(type) {
  if (type === "CorrectPer1M" || type === "CorrectPer2M") return "時"
  else if (type === "PercentIn1M" || type === "PercentIn2M") return "率"
  else if (type === "InRow1M" || type === "InRow2M") return "列"
  else if (type === "CorrectSum") return "総"
  else return "那"
}

function getLevel(x) {
  if (x < 0) throw new Error("x must be non-negative");

  const k = Math.ceil((1 + Math.sqrt(1 + 4 * x / 5)) / 2);

  return k - 1;
}

function getRemainXP(x, k) {
  if (x < 0) throw new Error("x must be non-negative");

  const threshold = 5 * k * (k - 1);
  return x - threshold;
}

function getMaxXPForLevel(level) {
  if (level < 0) throw new Error("level must be non-negative");

  const nextLevelMinXP = 5 * (level + 1) * level;
  return nextLevelMinXP;
}

function getLevelXP(level) {
  return getMaxXPForLevel(level) - getMaxXPForLevel(level - 1);
}



function loginGit() {
  window.location.assign("https://github.com/login/oauth/authorize?client_id=" + CLIENT_ID);
}

function unlogin() {
  localStorage.removeItem("accessToken");
  window.location.reload();
}

const ProfileMenu = ({ userData, quests, vocs, isPicked, back }) => {

  const level = getLevel(userData.experience);
  const remainXP = getRemainXP(userData.experience, level);
  const maxXP = getMaxXPForLevel(level);
  const ratio = remainXP / maxXP;
  const width = 300 * (
    getRemainXP(userData.experience, getLevel(userData.experience))
    / getLevelXP(getLevel(userData.experience)))

  console.log({
    experience: userData.experience,
    level,
    remainXP,
    maxXP,
    ratio,
    width
  });
  // const level = useRef(getLevel(userData.experience));
  // const remainXP = useRef(getRemainXP(userData.experience, level));

  return (
    <div className={`${isPicked ? 'slide-in-blurred-right' : 'slide-out-blurred-right'} list-menu-container`}>
      <h1>Profile</h1>

      <div className="card">
        {

          userData.login ?
            (
              <div className="main-container">
                <div>
                  <div className="container">
                    <img src={userData.avatar_url} className="git-image"></img>

                    <a href={`https://github.com/${userData.login}`} className="git-login">
                      {userData.login}
                    </a>

                  </div>

                  <p>
                    Level: {getLevel(userData.experience)}   <br />
                    XP: {getRemainXP(userData.experience, getLevel(userData.experience))} / {getLevelXP(getLevel(userData.experience))}
                  </p>

                  <div className="level-bar">
                    <div className="level-bar-pro" style={{
                      width: `${100 * (
                        getRemainXP(userData.experience, getLevel(userData.experience))
                        / getLevelXP(getLevel(userData.experience)))}%`
                    }}></div>
                  </div>

                  <a className="unlogin" onClick={unlogin}>
                    Unlogin
                  </a>
                </div>


                <div>

                  {quests.map((quest, index) => (
                    <div className="quest-block" key={index}
                      style={{
                        '--progress': `${quest.progress == 0 || quest.isCompleted ? 0 :
                          quest.current / quest.progress * 100 - 3
                          }%`
                      }}>

                      <p className={`quest-icon ${quest.isCompleted ? "completed-icon" : ""}`}>
                        {questIcon(quest.questType)}</p>

                      <div className="quest-desc-block">
                        <p className={`quest-description ${quest.isCompleted ? "completed-desc" : ""}`}>
                          {quest.description.replace("@", vocs[quest.wordList - 1].title)}</p>

                        {quest.progress != 0}
                      </div>

                    </div>
                  ))}

                </div>


              </div>
            )
            :
            (
              <div>

                <a onClick={loginGit}>
                  Login via GitHub
                </a>
              </div>
            )

        }


      </div>

      <button onClick={() => back(!isPicked)}>帰</button>
    </div >
  );
}

export default ProfileMenu;