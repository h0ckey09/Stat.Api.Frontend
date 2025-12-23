import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';

/**
 * Dialog for adding a new page to a binder
 * Shows study visit selection if binder is associated with a study
 */
const AddPageDialog = ({ open, onClose, onAdd, binderId, studyId }) => {
  const [pageName, setPageName] = useState('');
  const [selectedVisitId, setSelectedVisitId] = useState('');
  const [studyVisits, setStudyVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load study visits if binder has a study
  useEffect(() => {
    const loadStudyVisits = async () => {
      if (!studyId || !open) {
        setStudyVisits([]);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const Auth = window.Auth;
        if (!Auth || !Auth.isLoggedIn()) {
          setError('Not authenticated');
          return;
        }

        const endpoint = studyId.toString().includes('localhost') || studyId.toString().includes('127.0.0.1')
          ? `http://localhost:3001/api/v1/studies/GetStudyVisits/${studyId}`
          : `/api/v1/studies/GetStudyVisits/${studyId}`;

        console.log('📡 Fetching study visits from:', endpoint);
        const data = await Auth.authGet(endpoint);
        console.log('✅ Study visits loaded:', data);
        setStudyVisits(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load study visits:', err);
        setError('Failed to load study visits');
        setStudyVisits([]);
      } finally {
        setLoading(false);
      }
    };

    loadStudyVisits();
  }, [studyId, open]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setPageName('');
      setSelectedVisitId('');
      setError('');
    }
  }, [open]);

  const handleAdd = () => {
    // If study visit is selected, use visit name as page name
    let finalPageName = pageName.trim();
    
    if (selectedVisitId) {
      const selectedVisit = studyVisits.find(v => (v.Id || v.id) === parseInt(selectedVisitId));
      if (selectedVisit) {
        finalPageName = selectedVisit.Name || selectedVisit.name || `Visit ${selectedVisitId}`;
      }
    }
    
    if (!finalPageName) {
      setError('Page name is required');
      return;
    }

    const pageData = {
      name: finalPageName,
      binderId: parseInt(binderId)
    };

    // Add study visit if selected
    if (selectedVisitId) {
      pageData.studyVisitId = parseInt(selectedVisitId);
    }

    onAdd(pageData);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Page</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Page Name"
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            required
            autoFocus
            disabled={!!selectedVisitId}
            helperText={selectedVisitId ? "Page name will be set from selected visit" : ""}
          />

          {studyId && (
            <FormControl fullWidth>
              <InputLabel>Study Visit (Optional)</InputLabel>
              <Select
                value={selectedVisitId}
                label="Study Visit (Optional)"
                onChange={(e) => setSelectedVisitId(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {loading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading visits...
                  </MenuItem>
                ) : (
                  studyVisits.map((visit) => (
                    <MenuItem key={visit.Id || visit.id} value={visit.Id || visit.id}>
                      {visit.Name || visit.name || `Visit ${visit.Id || visit.id}`}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained" disabled={!selectedVisitId && !pageName.trim()}>
          Add Page
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPageDialog;
