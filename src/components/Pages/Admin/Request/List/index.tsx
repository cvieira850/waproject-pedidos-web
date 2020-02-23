import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from 'components/Layout/Toolbar';
import CardLoader from 'components/Shared/CardLoader';
import EmptyAndErrorMessages from 'components/Shared/Pagination/EmptyAndErrorMessages';
import SearchField from 'components/Shared/Pagination/SearchField';
import TableCellActions from 'components/Shared/Pagination/TableCellActions';
import TableCellSortable from 'components/Shared/Pagination/TableCellSortable';
import TablePagination from 'components/Shared/Pagination/TablePagination';
import TableWrapper from 'components/Shared/TableWrapper';
import usePaginationObservable from 'hooks/usePagination';
import IRequest from 'interfaces/models/request';
import RefreshIcon from 'mdi-react/RefreshIcon';
import React, { Fragment, memo, useCallback, useState } from 'react';
import requestService from 'services/request';

import RequestFormDialog from '../RequestFormDialog';
import ListItem from './ListItem';

const RequestListPage = memo(() => {
  const [formOpened, setFormOpened] = useState(false);
  const [current, setCurrent] = useState();

  const [params, mergeParams, loading, data, error, , refresh] = usePaginationObservable(
    params => requestService.list(params),
    { orderBy: 'name', orderDirection: 'asc' },
    []
  );

  const handleCreate = useCallback(() => {
    setCurrent(null);
    setFormOpened(true);
  }, []);

  const handleEdit = useCallback((current: IRequest) => {
    setCurrent(current);
    setFormOpened(true);
  }, []);

  const formCallback = useCallback(
    (request?: IRequest) => {
      setFormOpened(false);
      current ? refresh() : mergeParams({ term: request.type });
    },
    [current, mergeParams, refresh]
  );

  const formCancel = useCallback(() => setFormOpened(false), []);
  const handleRefresh = useCallback(() => refresh(), [refresh]);

  const { total, results } = data || ({ total: 0, results: [] } as typeof data);

  return (
    <Fragment>
      <Toolbar title='Pedidos' />

      <Card>
        <RequestFormDialog opened={formOpened} request={current} onComplete={formCallback} onCancel={formCancel} />

        <CardLoader show={loading} />

        <CardContent>
          <Grid container justify='space-between' alignItems='center' spacing={2}>
            <Grid item xs={12} sm={6} lg={4}>
              <SearchField paginationParams={params} onChange={mergeParams} />
            </Grid>

            <Grid item xs={12} sm={'auto'}>
              <Button fullWidth variant='contained' color='primary' onClick={handleCreate}>
                Adicionar
              </Button>
            </Grid>
          </Grid>
        </CardContent>

        <TableWrapper minWidth={500}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCellSortable paginationParams={params} disabled={loading} onChange={mergeParams} column='name'>
                  Nome
                </TableCellSortable>
                <TableCellSortable paginationParams={params} disabled={loading} onChange={mergeParams} column='type'>
                  tipo
                </TableCellSortable>
                <TableCellSortable paginationParams={params} disabled={loading} onChange={mergeParams} column='amount'>
                  Quantidade
                </TableCellSortable>
                <TableCellActions>
                  <IconButton disabled={loading} onClick={handleRefresh}>
                    <RefreshIcon />
                  </IconButton>
                </TableCellActions>
              </TableRow>
            </TableHead>
            <TableBody>
              <EmptyAndErrorMessages
                colSpan={3}
                error={error}
                loading={loading}
                hasData={results.length > 0}
                onTryAgain={refresh}
              />
              {results.map(request => (
                <ListItem key={request.id} request={request} onEdit={handleEdit} onDeleteComplete={refresh} />
              ))}
            </TableBody>
          </Table>
        </TableWrapper>

        <TablePagination total={total} disabled={loading} paginationParams={params} onChange={mergeParams} />
      </Card>
    </Fragment>
  );
});

export default RequestListPage;
