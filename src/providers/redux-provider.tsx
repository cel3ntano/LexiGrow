'use client';

import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';

export function ReduxProvider({ children }: Readonly<PropsWithChildren>) {
  return <Provider store={store}>{children}</Provider>;
}
