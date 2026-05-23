import "../css/App.css";
import "../css/ProfileMenu.css";

import {
  getLevel,
  getLevelXP,
  getRemainXP,
  loginGit,
  questIcon,
  unlogin
} from "../functions/JSFuncs";

import { HighlightedDescription } from "../functions/ReactFuncs";
import QuestTimer from "./QuestTimer";

// Обновленная функция: принимает goToMain вместо старого back
function setQuest(quest, setTime, setList, goToMain) {
  if (!quest.isCompleted) {
    setList(quest.wordList - 1);
    if (quest.time !== 0) setTime(quest.time - 1);
    goToMain(); // Закрываем подменю и возвращаем пользователя на главную
  }
}

// Принимает новые пропсы isActive, isPicked и goToMain
const ProfileMenu = ({ userData, quests, vocs, isActive, isPicked, back, setTheme, theme, setTime, setList, goToMain }) => {

  // Та же логика анимации и скрытия через .noMore
  const animationClass = isActive 
    ? (isPicked ? 'slide-in-blurred-right' : 'slide-out-blurred-right') 
    : 'noMore';

  return (
    <div className={`${animationClass} list-menu-container`}>
      <h1>Profile</h1>

      <div className="card">
        {
          userData.login ?
            (
              <div className="main-container">
                <div>
                  <div className="container">
                    <img src={userData.avatar_url} className="git-image" alt="avatar"></img>

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
                    <a onClick={() => setTheme(!theme)}>
                      Set {theme ? "light" : "dark"} theme
                    </a>
                  </div>

                  <a className="unlogin" onClick={unlogin}>
                    Unlogin
                  </a>
                </div>

                {quests === undefined || quests.length === 0 ?
                  (
                    <div>
                      <span className="spinner">字</span>
                    </div>
                  )
                  :
                  (<div>
                    <div className="container2">

                      {quests.map((quest, index) => (
                        <div className={`quest-block ${quest.isCompleted ? "" : "completed-quest"}`} key={index}
                          onClick={() => setQuest(quest, setTime, setList, goToMain)} // Передаем актуальный колбэк перехода
                          style={{
                            '--progress': `${quest.progress === 0 || quest.isCompleted ? 0 :
                              quest.current / quest.progress * 100
                              }%`,

                            cursor: `${quest.isCompleted ? "auto" : "pointer"}`
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

      {/* Кнопка теперь чисто дергает закрытие без изменения аргументов */}
      <button onClick={back}>帰</button>
    </div >
  );
}

export default ProfileMenu;