import {server} from './server';

import * as React from 'react';

function ServerComponent(): JSX.Element {
	server.addListener('close', () => {
		console.log('Server Closed');
	});
	return <div>Tester</div>;
}

export default ServerComponent;
