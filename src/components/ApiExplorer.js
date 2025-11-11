import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { apiService } from '../services/apiService';

const ApiExplorer = () => {
  const [endpoint, setEndpoint] = useState('');
  const [method, setMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [discoveredEndpoints, setDiscoveredEndpoints] = useState([]);
  const [discovering, setDiscovering] = useState(false);

  useEffect(() => {
    discoverEndpoints();
  }, []);

  const discoverEndpoints = async () => {
    setDiscovering(true);
    try {
      const results = await apiService.discoverEndpoints();
      setDiscoveredEndpoints(results);
    } catch (error) {
      console.error('Failed to discover endpoints:', error);
    } finally {
      setDiscovering(false);
    }
  };

  const makeRequest = async () => {
    if (!endpoint.trim()) {
      setError('Please enter an endpoint');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      let result;
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      
      switch (method) {
        case 'GET':
          result = await apiService.get(cleanEndpoint);
          break;
        case 'POST':
          const postData = requestBody ? JSON.parse(requestBody) : {};
          result = await apiService.post(cleanEndpoint, postData);
          break;
        case 'PUT':
          const putData = requestBody ? JSON.parse(requestBody) : {};
          result = await apiService.put(cleanEndpoint, putData);
          break;
        case 'DELETE':
          result = await apiService.delete(cleanEndpoint);
          break;
        default:
          throw new Error('Unsupported method');
      }

      setResponse({
        status: result.status,
        statusText: result.statusText,
        headers: result.headers,
        data: result.data
      });
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      if (error.response) {
        setResponse({
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 400 && status < 500) return 'warning';
    if (status >= 500) return 'error';
    return 'default';
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        API Explorer
      </Typography>
      
      <Typography variant="body1" paragraph>
        Explore and test endpoints from your backend server at https://www.statresearch.com:3001
      </Typography>

      {/* Discovered Endpoints Section */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Discovered Endpoints {discovering && <CircularProgress size={16} sx={{ ml: 1 }} />}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {discoveredEndpoints.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {discoveredEndpoints.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 120 }}>
                    {item.endpoint}
                  </Typography>
                  <Chip 
                    label={item.status} 
                    size="small" 
                    color={item.status === 'success' ? 'success' : 'error'}
                  />
                  {item.status === 'error' && (
                    <Typography variant="caption" color="text.secondary">
                      {item.error}
                    </Typography>
                  )}
                </Box>
              ))}
              <Button 
                variant="outlined" 
                size="small" 
                onClick={discoverEndpoints}
                disabled={discovering}
                sx={{ alignSelf: 'flex-start', mt: 1 }}
              >
                Refresh Discovery
              </Button>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No endpoints discovered yet. Try manual exploration below.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Manual Request Section */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Make API Request
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-end' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Method</InputLabel>
            <Select
              value={method}
              label="Method"
              onChange={(e) => setMethod(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="GET">GET</MenuItem>
              <MenuItem value="POST">POST</MenuItem>
              <MenuItem value="PUT">PUT</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Endpoint (e.g., /api/users, /health)"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            disabled={loading}
            placeholder="/api/endpoint"
          />

          <Button
            variant="contained"
            onClick={makeRequest}
            disabled={loading || !endpoint.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Send'}
          </Button>
        </Box>

        {(method === 'POST' || method === 'PUT') && (
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Request Body (JSON)"
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
            placeholder='{"key": "value"}'
          />
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {response && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Response
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={`${response.status} ${response.statusText}`}
                color={getStatusColor(response.status)}
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={10}
              label="Response Data"
              value={JSON.stringify(response.data, null, 2)}
              InputProps={{
                readOnly: true,
              }}
              sx={{ fontFamily: 'monospace' }}
            />
          </Box>
        )}
      </Paper>

      {/* Common Endpoints to Try */}
      <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Common Endpoints to Try
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {[
            '/api',
            '/api/v1',
            '/auth/login',
            '/auth/profile',
            '/health',
            '/status',
            '/users',
            '/data'
          ].map((path) => (
            <Button
              key={path}
              variant="outlined"
              size="small"
              onClick={() => setEndpoint(path)}
              disabled={loading}
            >
              {path}
            </Button>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default ApiExplorer;
