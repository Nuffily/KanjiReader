import "../css/app.css";
import "../css/ProfileMenu.css"

import {
  questIcon,
  getLevel,
  getRemainXP,
  getLevelXP,
  loginGit,
  unlogin,
  getTimeRemaining
} from "../functions/JSFuncs";

import { HighlightedDescription } from "../functions/ReactFuncs";
import QuestTimer from "./QuestTimer";

const ProfileMenu = ({ userData, quests, vocs, isPicked, back, setTheme, theme }) => {

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

                  <div className="theme-change">
                    <a  onClick={() => setTheme(!theme)}>
                      Set {theme ? "light" : "dark"} theme 
                    </a>
                  </div>

                  <a className="unlogin" onClick={unlogin}>
                    Unlogin
                  </a>
                </div>

                {quests === undefined ?
                  (
                    <div>
                      <span className="spinner">字</span>
                    </div>
                  )
                  :
                  (<div>
                    <div className="container2">

                      {quests.map((quest, index) => (
                        <div className="quest-block" key={index}
                          style={{
                            '--progress': `${quest.progress == 0 || quest.isCompleted ? 0 :
                              quest.current / quest.progress * 100
                              }%`
                          }}>

                          <p className={`quest-icon ${quest.isCompleted ? "completed-icon" : ""}`}>
                            {questIcon(quest.questType)}
                          </p>

                          <div className="quest-desc-block">
                            <div className={`quest-description ${quest.isCompleted ? "completed-desc" : ""}`}>
                              <HighlightedDescription quest={quest} vocs={vocs} />
                            </div>
                          </div>

                        </div>
                      ))}

                    </div>

                    <div className="refill">Until quest refill: <QuestTimer targetDate={userData.refill} /></div>

                  </div>)}



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