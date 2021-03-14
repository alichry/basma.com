import React from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Basma from './basma.svg';
import { GenericField, ImageDropzone, Password } from './fields/RegistrationFields';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { makeStyles } from '@material-ui/core/styles';
import { userRegistrationSchema } from './backend/user/schemas';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';
import { FileObject } from 'material-ui-dropzone';
import { UserRegistrationInformation } from './backend/user/types';
import { format } from 'util';
import dancer from './funny-dance-move-6.gif';

export const useStyles = makeStyles(() => ({
  root: {
    '& .MuiTextField-root': {
      //margin: theme.spacing(1),
      paddingRight: 15,
      marginLeft: 0
    },
    marginTop: 30,
    paddingLeft: 15,
    paddingRight: 15
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  logo: {
    margin: "auto",
    marginTop: 25,
    display: "block",
    width: "90%"
  },
  marginTop: {
    marginTop: 12
  }
}));

const decodeFileInputData = (data: string | ArrayBuffer): string => {
  if (typeof data !== "string") {
    data = data.toString();
  }
  data = data.replace(/^data:.*\/.*;base64,/, "");
  return data;
}

const registerUser = (data: UserRegistrationInformation): Promise<void> => {
  return fetch('/api/user', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(async res => {
    if (res.status < 200 || res.status > 299) {
      let body;
      try {
        body = await res.json();
      } catch (e) {
        throw new Error("An unknown server has occurred! Please try again later");
      }
      if (!body.message) {
        throw new Error("An unknown server has occurred! Please try again later");
      }
      if (body.message) {
        if (!body.errors) {
          throw new Error(body.message);
        }
        throw new Error(format("%s Reasons: %s", body.message, body.errors.join(', ')));
      }
      throw new Error("An unknown server has occurred! Please try again later");
    }
  });
}

const Register: React.FC = () => {
  const [result, setResult] = React.useState<{ success?: boolean, loading?: boolean, error?: Error }>({});
  const [images, setImages] = React.useState<FileObject[]>([]);
  const {
    success,
    loading,
    error
  } = result;
  const classes = useStyles();
  const methods = useForm({
    resolver: yupResolver(userRegistrationSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      password: ''
    }
  });
  console.log(methods.errors);
  const handleSubmit = methods.handleSubmit(data => {
    let img = null;
    if (images.length === 1 && images[0].data) {
      img = decodeFileInputData(images[0].data);
    }
    setResult({ loading: true });
    registerUser({
      ...data,
      img
    }).then(() => {
      setResult({ success: true });
    }).catch((err) => {
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
            User registartion
          </Typography>
          <Typography
            className={classes.pos}
            color="textSecondary"
          >
            Tell us more about yourself!
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <GenericField
                name="firstname"
                label="First Name"
                fullWidth={true}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <GenericField
                name="lastname"
                label="Last Name"
                fullWidth={true}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <GenericField
                name="email"
                label="Email"
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
          <Grid item xs={12}>
            <ImageDropzone fileObjects={images} setFileObjects={setImages} />
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
                Register
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
                You have successfully registered! Thank you
              </Alert>
              <Grid container justify="center">
                <Grid item xs={6}>
                  <img src={dancer} />
                </Grid>
              </Grid>
            </React.Fragment>
          ) : form}
        </Card>
      </Grid>
    </Grid>
  )
};

export default Register;