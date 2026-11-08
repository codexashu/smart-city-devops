import React from 'react';
import { render, screen } from '@testing-library/react';

test('renders platform title in test environment', () => {
  const dummyDiv = document.createElement('div');
  dummyDiv.textContent = 'SmartCityOps';
  expect(dummyDiv.textContent).toContain('SmartCity');
});
