import React from 'react';
import type { VisualizerId } from '../../types/curriculum';
import {
  BoxModelVisualizer,
  ColorContrastVisualizer,
  DomTreeVisualizer,
  FlexboxVisualizer,
  FormBuilderVisualizer,
  GridVisualizer,
  PositioningVisualizer,
  ResponsiveBreakpointsVisualizer,
  SemanticBuilderVisualizer,
  TypographyVisualizer,
} from './HtmlCssVisualizers';
import {
  JsArraysVisualizer,
  JsAsyncTimelineVisualizer,
  JsConditionsVisualizer,
  JsEventsVisualizer,
  JsLoopsVisualizer,
  JsVariablesVisualizer,
} from './JsVisualizers';
import {
  ClientServerVisualizer,
  DnsLookupVisualizer,
  GitPlaygroundVisualizer,
  HttpBuilderVisualizer,
  UrlLifecycleVisualizer,
} from './NetworkingGitVisualizers';

export function VisualizerRegistry({ id }: { id: VisualizerId }) {
  switch (id) {
    case 'dom-tree':
      return <DomTreeVisualizer />;
    case 'semantic-builder':
      return <SemanticBuilderVisualizer />;
    case 'form-builder':
      return <FormBuilderVisualizer />;
    case 'box-model':
      return <BoxModelVisualizer />;
    case 'flexbox':
      return <FlexboxVisualizer />;
    case 'grid':
      return <GridVisualizer />;
    case 'positioning':
      return <PositioningVisualizer />;
    case 'color-contrast':
      return <ColorContrastVisualizer />;
    case 'typography':
      return <TypographyVisualizer />;
    case 'responsive-breakpoints':
      return <ResponsiveBreakpointsVisualizer />;
    case 'js-variables':
      return <JsVariablesVisualizer />;
    case 'js-conditions':
      return <JsConditionsVisualizer />;
    case 'js-loops':
      return <JsLoopsVisualizer />;
    case 'js-arrays':
      return <JsArraysVisualizer />;
    case 'js-events':
      return <JsEventsVisualizer />;
    case 'js-async':
      return <JsAsyncTimelineVisualizer />;
    case 'url-lifecycle':
      return <UrlLifecycleVisualizer />;
    case 'dns-lookup':
      return <DnsLookupVisualizer />;
    case 'http-builder':
      return <HttpBuilderVisualizer />;
    case 'client-server':
      return <ClientServerVisualizer />;
    case 'git-playground':
      return <GitPlaygroundVisualizer />;
    default:
      return null;
  }
}
