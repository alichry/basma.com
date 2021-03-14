import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField, { TextFieldProps } from '@material-ui/core/TextField'
import {
  Controller,
  useFormContext
} from 'react-hook-form'
import _ from 'lodash';
import { OutlinedInputProps } from '@material-ui/core/OutlinedInput'
import IconButton from '@material-ui/core/IconButton'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import InputAdornment from '@material-ui/core/InputAdornment'
import { DropzoneAreaBase, FileObject } from 'material-ui-dropzone';

const useStyles = makeStyles(() => ({
  dropzoneText: {
    fontSize: '1.2em'
  },
  chip: {
    marginLeft: '15px'
  },
  imageDropzone: {
    marginTop: 12
  },
  imageDropzoneContainer: {
    paddingLeft: 0,
    margin: "0 auto"
  }
}))

export interface PasswordProps extends OutlinedInputProps {
    name: string,
    label?: string,
    defaultValue?: string,
    endAdornment?: React.ReactElement,
    textFieldProps?: TextFieldProps
}

export const GenericField: React.FC<TextFieldProps> = (props) => {
  if (! props.name) {
    throw new Error("Name is required for GenericField to work!");
  }
  const { name, label } = props;
  const { control, errors } = useFormContext()
  return (
    <Controller
      name={name}
      control={control}
      render={({ onChange, onBlur, value }) => (
        <TextField
          {...props}
          label={label || name.charAt(0).toUpperCase() + name.slice(1)}
          variant="outlined"
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          error={!!_.get(errors, name)}
          helperText={_.get(errors, name + ".message")}
        />
      )}
    />
  )
}

export const Password: React.FC<PasswordProps> = (props: PasswordProps) => {
  const {
    name,
    label = 'Password',
    defaultValue,
    endAdornment
  } = props
  const { control, errors } = useFormContext()

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ onChange, onBlur, value }) => (
        <PasswordField
          label={label}
          fullWidth={true}
          variant="outlined"
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          error={!!_.get(errors, name)}
          helperText={_.get(errors, name + '.message')}
          {...props.textFieldProps}
          InputProps={{ endAdornment: endAdornment }}
        />
      )}
    />
  )
}

export const PasswordField: React.FC<TextFieldProps> = (props) => {
  const [visibility, setVisibility] = useState<boolean>(false)
  const toggleVisibility = () => setVisibility(!visibility)
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }
  const visibilityButton = (
    <IconButton
      aria-label="toggle password visibility"
      onClick={() => toggleVisibility()}
      onMouseDown={handleMouseDownPassword}
      edge="end"
    >
      {visibility ? <Visibility /> : <VisibilityOff />}
    </IconButton>
  )
  // TODO: remove any
  const endInputAdornment: any = props.InputProps?.endAdornment
  let endInputAdornmentChildren: any = null
  if (endInputAdornment) {
    endInputAdornmentChildren = endInputAdornment.props?.children
  }

  return (
    <TextField
      type={visibility ? 'text' : 'password'}
      fullWidth={true}
      variant="outlined"
      {...props}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {visibilityButton}
            {endInputAdornmentChildren}
          </InputAdornment>
        )
      }}
    />
  )
}
export interface ImageDropzoneProps {
    fileObjects: FileObject[],
    setFileObjects: React.Dispatch<React.SetStateAction<FileObject[]>>
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({ fileObjects, setFileObjects }) => {
  const classes = useStyles()
  return (
    <DropzoneAreaBase
      dropzoneClass={classes.imageDropzone}
      acceptedFiles={['image/*']}
      filesLimit={1}
      fileObjects={fileObjects}
      dropzoneText={"Drag and drop an image here or click (optional)"}
      dropzoneParagraphClass={classes.dropzoneText}
      showFileNames={true}
      showFileNamesInPreview={true}
      useChipsForPreview={false}
      previewGridClasses={{
        item: classes.imageDropzoneContainer
      }}
      // enabling alerts would cause a findDOmNode deprecation warning
      showAlerts={false}
      onAdd={(newFileObjs) => {
        const x: FileObject[] = []
        setFileObjects(x.concat(fileObjects, newFileObjs))
      }}
      onDelete={deleteFileObj => {
        const res = _.filter(fileObjects, (item) => {
          return item !== deleteFileObj
        })
        setFileObjects(res)
      }}
    />
  )
}