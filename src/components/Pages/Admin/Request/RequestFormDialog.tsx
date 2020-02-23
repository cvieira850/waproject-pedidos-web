import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinearProgress from '@material-ui/core/LinearProgress';
import Slide from '@material-ui/core/Slide';
import makeStyles from '@material-ui/core/styles/makeStyles';
import FormValidation from '@react-form-fields/material-ui/components/FormValidation';
import FieldText from '@react-form-fields/material-ui/components/Text';
import Toast from 'components/Shared/Toast';
import { logError } from 'helpers/rxjs-operators/logError';
import useModel from 'hooks/useModel';
import IRequest from 'interfaces/models/request';
import React, { forwardRef, Fragment, memo, useCallback, useState } from 'react';
import { useCallbackObservable } from 'react-use-observable';
import { of } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import requestService from 'services/request';

interface IProps {
  opened: boolean;
  request?: IRequest;
  onComplete: (request: IRequest) => void;
  onCancel: () => void;
}

const useStyle = makeStyles({
  content: {
    width: 400,
    maxWidth: 'calc(95vw - 50px)'
  },
  heading: {
    marginTop: 20,
    marginBottom: 10
  }
});

const RequestFormDialog = memo((props: IProps) => {
  const classes = useStyle(props);

  const [model, setModelProp, setModel, , clearModel] = useModel<IRequest>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleEnter = useCallback(() => {
    setModel({ ...(props.request || {}) });
  }, [props.request, setModel]);

  const handleExit = useCallback(() => {
    clearModel();
  }, [clearModel]);

  const [onSubmit] = useCallbackObservable(
    (isValid: boolean) => {
      return of(isValid).pipe(
        filter(isValid => isValid),
        tap(() => setLoading(true)),
        switchMap(() => requestService.save(model as IRequest)),
        tap(
          request => {
            Toast.show(`${request.name} foi salvo${model.id ? '' : ', um email foi enviado com a senha'}`);
            props.onComplete(request);
            setLoading(false);
          },
          err => {
            console.log(err);

            Toast.error(err.message);
            setLoading(false);
          }
        ),
        logError()
      );
    },
    [model]
  );

  return (
    <Dialog
      open={props.opened}
      disableBackdropClick
      disableEscapeKeyDown
      onEnter={handleEnter}
      onExited={handleExit}
      TransitionComponent={Transition}
    >
      {loading && <LinearProgress color='secondary' />}

      <FormValidation onSubmit={onSubmit}>
        <DialogTitle>{model.id ? 'Editar' : 'Novo'} Pedido</DialogTitle>
        <DialogContent className={classes.content}>
          <Fragment>
            <FieldText
              label='Nome'
              disabled={loading}
              value={model.name}
              validation='required|min:3|max:50'
              onChange={setModelProp('name', (model, v) => (model.name = v))}
            />

            <FieldText
              label='Tipo'
              disabled={loading}
              value={model.type}
              validation='string|min:3|max:50'
              onChange={setModelProp('type', (model, v) => (model.type = v))}
            />

            <FieldText
              label='Quantidade'
              type='number'
              disabled={loading}
              value={model.amount}
              validation='required|numeric|min:1'
              onChange={setModelProp('amount', (model, v) => (model.amount = parseInt(v)))}
            />
          </Fragment>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onCancel}>Cancelar</Button>
          <Button color='primary' type='submit' disabled={loading}>
            Salvar
          </Button>
        </DialogActions>
      </FormValidation>
    </Dialog>
  );
});

const Transition = memo(
  forwardRef((props: any, ref: any) => {
    return <Slide direction='up' {...props} ref={ref} />;
  })
);

export default RequestFormDialog;
