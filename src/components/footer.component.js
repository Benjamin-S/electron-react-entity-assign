import React from 'react';

import '../styles/styles.scss';

function Footer() {
  function changeTheme(theme) {
    document.documentElement.className = '';
    document.documentElement.classList.add(`theme-${theme}`);
  }
  function toggleTheme() {
    document.documentElement.className === 'theme-dark'
      ? changeTheme('light')
      : changeTheme('dark');
  }

  return (
    <div className="windowFooter">
      <i
        className="codicon codicon-color-mode theme-toggle"
        onClick={toggleTheme}
      ></i>
    </div>
  );
}

export default Footer;
