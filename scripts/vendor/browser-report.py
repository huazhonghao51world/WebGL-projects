from pathlib import Path
import json
value=js('JSON.stringify({diagnostics:window.__dengtaDiagnostics,viewerState:window.__dengtaVendorApp.viewer.getState(),catalogAvailable:window.__dengtaVendorApp.customApi.has("getCatalog"),userAgent:navigator.userAgent,resources:performance.getEntriesByType("resource").map(x=>({url:x.name,transferSize:x.transferSize})),uiText:document.body.innerText.slice(-1500)})')
report=json.loads(value)
events=drain_events()
report['runtimeExceptions']=[e['params'].get('exceptionDetails',{}).get('text') for e in events if e.get('method')=='Runtime.exceptionThrown']
report['failedRequests']=[{'error':e['params'].get('errorText'),'blockedReason':e['params'].get('blockedReason')} for e in events if e.get('method')=='Network.loadingFailed']
report['externalRequests']=[x for x in report['resources'] if not x['url'].startswith(('http://localhost:3766/','blob:','data:'))]
Path('E:/All_in_wdp/wdpapi_sdk/dengta-twinProject/vendor-staging/browser-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'state':report['viewerState'],'catalog':report['catalogAvailable'],'requests':len(report['resources']),'external':report['externalRequests'],'exceptions':report['runtimeExceptions'],'failed':report['failedRequests'],'vtkRequests':len([x for x in report['resources'] if '/vtk/' in x['url']])},ensure_ascii=False))
capture_screenshot('E:/All_in_wdp/wdpapi_sdk/dengta-twinProject/vendor-staging/vtk-ready.png',max_dim=1600)
