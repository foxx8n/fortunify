import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  '& .ReactCrop': {
    maxWidth: '100%',
    maxHeight: '60vh',
  },
}));

interface ImagePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  onConfirm: (crop: Crop) => void;
}

const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({
  open,
  onClose,
  imageUrl,
  onConfirm,
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });

  const handleConfirm = () => {
    onConfirm(crop);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: theme => 
            theme.palette.mode === 'dark' 
              ? 'rgba(18, 18, 24, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      <DialogTitle>Preview & Crop Image</DialogTitle>
      <StyledDialogContent>
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          aspect={undefined}
        >
          <img
            src={imageUrl}
            alt="Preview"
            style={{ maxWidth: '100%', maxHeight: '60vh' }}
          />
        </ReactCrop>
        <Typography variant="caption" color="text.secondary">
          Drag to crop the image or click confirm to keep it as is
        </Typography>
      </StyledDialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImagePreviewDialog; 