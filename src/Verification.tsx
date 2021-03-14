import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { useParams } from 'react-router-dom';
import { handleResponse } from './utils';
import Typography from '@material-ui/core/Typography';

import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles(() => ({
  root: {
    marginTop: 25
  },
  grid: {
    marginTop: 25,
    height: 400,
    width: "100%"
  },
  searchField: {
    float: "right"
  }
}));


const Verification: React.FC = () => {
  const classes = useStyles();
  const { token } = useParams<{ token?: string }>();
  const [result, setResult] = React.useState<{ loading?: boolean, error?: Error }>({ loading: true });
  const {
    loading,
    error
  } = result;
  React.useEffect(() => {
    fetch('/api/user/verify/' + token, {
      method: "POST"
    }).then(async res => {
      await handleResponse(res);
      // no exception all good..
      setResult({ loading: false });
    }).catch(error => {
      setResult({ error });
    });
  }, []);
  return (
    <Grid container justify="center" spacing={2} className={classes.root}>
      <Grid item xs={12} sm={7}>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2">
              User verification
            </Typography>
            <Typography
              // className={classes.pos}
              color="textSecondary"
            >
              {loading && "We are verifying your account.."}
              { ! loading && ! error ? "You have successfully verified your account" : null}
              {error && error.message}
            </Typography>
            { loading ? <CircularProgress /> : null}
            
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
};

export default Verification;