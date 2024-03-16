import { Box, Button, Grid, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'

import { fetchFlow } from '../../apis/APIs'

const FlowDescription = ({ flowId }) => {
  const [state, setState] = useState()

  useEffect(() => {
    fetchFlow(flowId).then(res => {
      console.log('fetch flows!', res)
      setState(res)
    })
  }, [flowId])
  return (
    <Box sx={{ maxWidth: 400, m: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Profile
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Full Name"
            defaultValue="Yu-Hao Wang"
            variant="outlined"
          />
        </Grid>
        <Grid
          item
          xs={12}
          container
          alignItems="center"
          justifyContent="space-between">
          <Grid item>
            <Typography>Email</Typography>
          </Grid>
          <Grid item>
            <Typography>vnatcizhock@gmail.com</Typography>
          </Grid>
          <Grid item>
            <Button variant="outlined" size="small">
              Change
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Typography>Password</Typography>
          <Typography variant="body2" color="textSecondary">
            Managed by Google
          </Typography>
        </Grid>
      </Grid>
    </Box>
  )
}

export default FlowDescription
