import React, { memo } from 'react';
import { Route, Switch } from 'react-router-dom';

import RequestListPage from './List';

const RequestIndexPage = memo(() => {
  return (
    <Switch>
      <Route path='/' component={RequestListPage} />
    </Switch>
  );
});

export default RequestIndexPage;
