import { getLevel, getLevelXP, getRemainXP, loginGit, questIcon, unlogin } from "../functions/JSFuncs";
import { HighlightedDescription } from "../functions/ReactFuncs";
import QuestTimer from "./QuestTimer";
import ArchitectButton from '../../comp/buttons/ArchitectButton';
import './ProfileMenu.css';
import VoidTextButton from "../../comp/buttons/VoidTextButton";

function setQuest(quest, updateConfig, goToMain) {
  if (!quest.isCompleted) {
    const newWordList = quest.wordList - 1;
    const newTime = quest.time !== 0 ? quest.time - 1 : null;

    // Формируем объект обновлений
    const changes = { wordList: newWordList };
    if (newTime !== null) {
        changes.gameTime = newTime;
    }

    // Обновляем всё одной функцией
    updateConfig(changes);
    goToMain();
  }
}

const ProfileMenu = ({ userData, quests, vocs, isActive, isPicked, back, setTheme, theme, updateConfig, goToMain }) => {
  const animationClass = isActive
    ? (isPicked ? 'slide-in-blurred-right' : 'slide-out-blurred-right')
    : 'noMore';

  const userLevel = getLevel(userData.experience || 0);
  const currentXP = getRemainXP(userData.experience || 0, userLevel);
  const totalLevelXP = getLevelXP(userLevel);
  const barWidth = (100 * (currentXP / totalLevelXP)) + "%";

  const renderUserColumn = () => {
    return (
      <div className="profile-user-column">
        {/* Большой аватар и логин */}
        <div className="profile-row-static-hero">
          <img src={userData.avatar_url} className="profile-avatar-flat-hero" alt="" />
          <div className="profile-meta-hero">
            <a href={"https://github.com/" + userData.login} className="profile-username-link" target="_blank" rel="noreferrer">
              {userData.login}
            </a>
            <span className="profile-roman-number">LEVEL {userLevel}</span>
          </div>
        </div>

        {/* Прогресс бар опыта */}
        <div className="profile-xp-row">
          <div className="profile-xp-bar-bg">
            <div className="profile-xp-bar-fill" style={{ width: barWidth }}></div>
          </div>
          <div className="profile-xp-values">
            <span>EXPERIENCE</span>
            <span className="tabular-xp">{currentXP} / {totalLevelXP} XP</span>
          </div>
        </div>

        {/* Системные переключатели */}
        <div className="profile-controls-grid">
          <div className="profile-interactive-row" onClick={() => setTheme(!theme)}>
            <span className="profile-row-title">{theme ? "🌙 DARK MODE" : "☀️ LIGHT MODE"}</span>
            <span className="profile-row-indicator">此</span>
          </div>
          <div className="profile-interactive-row" onClick={unlogin}>
            <span className="profile-row-title out-action">UNLOGIN</span>
            <span className="profile-row-indicator">此</span>
          </div>
        </div>
      </div>
    );
  };

  const renderQuestsColumn = () => {
    if (quests === undefined || quests.length === 0) {
      return (
        <div className="profile-empty-spinner">
          <span className="profile-kanji-pulse">字</span>
        </div>
      );
    }

    return (
      <div className="profile-quests-column">
        <div className="profile-section-divider">RITUAL TASKS</div>
        <div className="profile-quests-list">
          {quests.map((quest, index) => {
            const isCompleted = quest.isCompleted;
            return (
              <div
                className={`profile-interactive-row ${isCompleted ? 'completed-task' : ''}`}
                key={index}
                onClick={() => setQuest(quest, updateConfig, goToMain)}
              >
                <div className="profile-quest-left">
                  <span className="profile-quest-type-icon">{questIcon(quest.questType)}</span>
                  <div className="profile-quest-text-content">
                    <HighlightedDescription quest={quest} vocs={vocs} />
                  </div>
                </div>
                <span className="profile-row-indicator">此</span>
              </div>
            );
          })}
        </div>
        <div className="profile-timer-row">
          <span>NEXT REFILL IN</span>
          <QuestTimer targetDate={userData.refill} />
        </div>
      </div>
    );
  };

  return (
    <div className={`${animationClass} list-menu-container profile-root-wrapper`}>
      <h1>{"PROFILE"}</h1>

      <div className="list-card profile-card-override">
        {userData.login ? (
          <div className="profile-grid-layout">
            {/* ЛЕВЫЙ СТОЛБЕЦ: ПРОФИЛЬ */}
            {renderUserColumn()}

            {/* ПРАВЫЙ СТОЛБЕЦ: КВЕСТЫ */}
            {renderQuestsColumn()}
          </div>
        ) : (
          <div className="profile-guest-fallback">

            <VoidTextButton onClick={loginGit} text={"Login via GitHub"}></VoidTextButton>
          </div>
        )}
      </div>

      <ArchitectButton className="list-menu-button" onClick={back} label={"帰 る"}></ArchitectButton>
    </div>
  );
};

export default ProfileMenu;