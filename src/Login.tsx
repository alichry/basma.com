import React from 'react';
import { connect } from "react-redux";
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { GenericField, Password } from './fields/RegistrationFields';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';
import { useStyles } from './Register';
import { adminLoginSchema } from './backend/admin/schemas';
import Basma from './basma.svg';
import { AdminState } from './store/admin/types';
import { adminLogin } from './store/admin/actions';
import { ApplicationState } from './store';
import { RouteComponentProps } from 'react-router-dom';
import { handleResponse } from './utils';

interface PropsFromState {
  adminState: AdminState
}

interface PropsFromDispatch {
  adminLogin: typeof adminLogin
}

type Props = PropsFromState & PropsFromDispatch & RouteComponentProps;

const authenticate = async (username: string, password: string): Promise<string> => {
  const res = await fetch('/api/admin/login', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  const body = await handleResponse(res);
  if (! body.token) {
    throw new Error("An unknown server has occurred! Please try again later");
  }
  return body.token;
}

const Login: React.FC<Props> = ({ adminLogin, adminState, history }) => {
  const classes = useStyles();
  const [result, setResult] = React.useState<{ success?: boolean, loading?: boolean, error?: Error }>({});
  const {
    success,
    error,
    loading
  } = result;

  const methods = useForm({
    resolver: yupResolver(adminLoginSchema),
    defaultValues: {
      username: adminState.username || '',
      password: ''
    }
  });

  const handleSubmit = methods.handleSubmit(data => {
    setResult({ loading: true });
    authenticate(data.username, data.password)
      .then(token => {
        adminLogin({ token });
        setResult({ success: true });
        setTimeout(() => {
          history.push('/admin/dashboard');
        }, 2000);
      })
      .catch((err) => {
        setResult({ error: err });
      });
  });

  const form = (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit}
      >
        {!!error && (
          <Alert
            elevation={6}
            variant="filled"
            severity="error"
            className={classes.marginTop}
          >
            {error.message}
          </Alert>
        )}
        <CardContent>
          <Typography variant="h5" component="h2">
            Admin log in
          </Typography>
          <Typography
            className={classes.pos}
            color="textSecondary"
          >
            Default admin username and password are configured
            using environment variables
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <GenericField
                name="username"
                label="Username"
                fullWidth={true}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Password
                name="password"
                label="Password"
                textFieldProps={{
                  fullWidth: true
                }}
              />
            </Grid>
          </Grid>
          <Grid container justify="center">
            <Grid item xs={2} className={classes.marginTop}>
              {loading ? <CircularProgress /> : null}
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Grid item xs={12}>
            {!loading ? (
              <Button
                size="medium"
                onClick={handleSubmit}
                style={{ float: "right" }}
              >
                Login
              </Button>
            ) : null}
          </Grid>
        </CardActions>
      </form>
    </FormProvider>
  );
  return (
    <Grid container justify="center" className={classes.root} spacing={1}>
      <Grid item xs={12} sm={4}>
        <Card>
          <CardMedia
            className={classes.logo}
            component="img"
            src={Basma}
          />
          {success ? (
            <React.Fragment>
              <Alert
                elevation={6}
                variant="filled"
                severity="info"
                className={classes.marginTop}
              >
                You have successfully logged in. You are now being redirected...
              </Alert>
            </React.Fragment>
          ) : form}
        </Card>
      </Grid>
    </Grid>
  );
}

const mapStateToProps = (state: ApplicationState): PropsFromState => ({
  adminState: state.admin
});

export const mapDispatchToProps: PropsFromDispatch = {
  adminLogin
};


export default connect(mapStateToProps, mapDispatchToProps)(Login);