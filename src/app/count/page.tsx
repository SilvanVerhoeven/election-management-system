import React from 'react';
import { ConfigProvider } from 'antd';
import theme from '@/theme/themeConfig'

const CountPage = () => (
  <ConfigProvider theme={theme}>
    Count
  </ConfigProvider>
);

export default CountPage