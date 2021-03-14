import React from 'react';
import { DataGrid, GridColumns, GridCellParams } from '@material-ui/data-grid';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { gql, useQuery } from '@apollo/client';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField'
import Switch from '@material-ui/core/Switch';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Modal from '@material-ui/core/Modal';
import { handleResponse } from './utils';
import { format } from 'util';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles(theme => ({
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
  },
  modalPaper: {
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    top: `50%`,
    left: `50%`,
    transform: `translate(-50%, -50%)`,
    //maxHeight: 450
  },
}));

const GET_USERS = gql`
query GetUsers($periodFilter: Int, $search: String) {
  users(periodFilter: $periodFilter, search: $search) {
    id
    firstname
    lastname
    email
    img
    createdAt
    status
  }
}
`;

interface ImageResult {
  mimetype: string,
  data: string
}

const Admin: React.FC = () => {
  const classes = useStyles();
  const [search, setSearch] = React.useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = React.useState<number>(0);
  const [open, setOpen] = React.useState<boolean>(false);
  const [selectedImage, setSelectedImage] = React.useState<ImageResult>();
  // P.S. We should use server-side pagination instead of client-side pagination.
  const { data, loading, error } = useQuery(GET_USERS, {
    variables: {
      periodFilter: selectedPeriod,
      search: search
    }
  });

  const formatImage = (mimetype: string, data: string): string => {
    return format("data:%s;base64,%s", mimetype, data);
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.checked) {
      setSelectedPeriod(0);
      return;
    }
    const flag = mapPeriodToFlag(event.target.name);
    setSelectedPeriod(flag);
  };

  const mapPeriodToFlag = (periodName: string): number => {
    const map: Record<string, number> = {
      last24: 1,
      lastWeek: 2,
      lastMonth: 4,
      last3Months: 8,
      lastYear: 16
    };
    if (!map[periodName]) {
      throw new Error("invalid period");
    }
    return map[periodName];
  }

  const modal = (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <Grid container justify="center" spacing={1}>
        <Grid item xs={12} sm={6} className={classes.modalPaper}>
          {!selectedImage ? <CircularProgress /> : <img src={formatImage(selectedImage.mimetype, selectedImage.data)} width="100%" />}
        </Grid>
      </Grid>
    </Modal>
  );

  //const rows = data?.users.map((d: User) => ({...d, img: <Button>click here</Button>}))
  const columns: GridColumns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'firstname', headerName: 'First name', width: 120 },
    { field: 'lastname', headerName: 'Last name', width: 120 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'status', headerName: "Verified", width: 100 },
    {
      field: 'img',
      headerName: 'Image',
      width: 100,
      renderCell(params: GridCellParams) {
        return (
          <strong>
            { !params.value ? "N/A" : (
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => {
                  setOpen(true)
                  setSelectedImage(undefined);
                  fetch('/api/admin/image/' + params.value)
                    .then(async res => {
                      const body = await handleResponse(res) as ImageResult;
                      setSelectedImage(body);
                    })
                }}
              >
                View
              </Button>
            )}
          </strong>
        )
      },
    },
    {
      field: 'createdAt',
      headerName: 'Craeted At',
      width: 250,
      renderCell(params: GridCellParams) {
        console.log("DATE: ", params.value);
        if (typeof params.value !== "string" || !params.value) {
          return <></>;
        }

        return (
          <strong>
            {(new Date(parseInt(params.value))).toISOString()}
          </strong>
        );
      }
    },
  ];
  return (
    <Grid container spacing={2} justify="center" className={classes.root}>
      <Grid item xs={12} sm={7}>
        <Card>
          {modal}
          <CardContent>
            <Typography variant="h5" component="h2">
              Registered users
            </Typography>
            {error?.message}
            <Grid container>
              <Grid item xs={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Period filter</FormLabel>
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch checked={mapPeriodToFlag("last24") === selectedPeriod} onChange={handleChange} name="last24" />}
                      label="Last 24 hours"
                    />
                    <FormControlLabel
                      control={<Switch checked={mapPeriodToFlag("lastWeek") === selectedPeriod} onChange={handleChange} name="lastWeek" />}
                      label="Last week"
                    />
                    <FormControlLabel
                      control={<Switch checked={mapPeriodToFlag("lastMonth") === selectedPeriod} onChange={handleChange} name="lastMonth" />}
                      label="Last month"
                    />
                    <FormControlLabel
                      control={<Switch checked={mapPeriodToFlag("last3Months") === selectedPeriod} onChange={handleChange} name="last3Months" />}
                      label="Last 3 months"
                    />
                    <FormControlLabel
                      control={<Switch checked={mapPeriodToFlag("lastYear") === selectedPeriod} onChange={handleChange} name="lastYear" />}
                      label="Last year"
                    />
                  </FormGroup>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Search"
                  variant="filled"
                  className={classes.searchField}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Grid>
            </Grid>
            <DataGrid pagination
              pageSize={10}
              loading={loading}
              rows={data?.users || []}
              columns={columns}
              className={classes.grid}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Admin;