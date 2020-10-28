import React from 'react';

const SideToolbar = () => {
	return (
		<div className="side-toolbar left">
			<div className="content">
				<div className="settings-bar">
					<ul className="settings-container">
						<li className="settings-item">
							<button type="button" className="side-toolbar-label">
								<span className="codicon codicon-settings-gear"/>
							</button>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default SideToolbar;
