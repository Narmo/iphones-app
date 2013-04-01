//
//  IPViewController.m
//  iPhones News
//
//  Created by Sergey Chikuyonok on 3/19/13.
//  Copyright (c) 2013 Sergey Chikuyonok. All rights reserved.
//

#import "IPViewController.h"

#import "ZKDefs.h"
#import "ZKFileArchive.h"
#import "ZKDataArchive.h"
#import "ZKCDHeader.h"

@interface IPViewController ()
- (void)unpackEngine;
@end

@implementation IPViewController

- (void)unpackEngine {
	ZKFileArchive *archive = [ZKFileArchive archiveWithArchivePath:[[NSBundle mainBundle] pathForResource:@"app" ofType:@"zip"]];
	
	// Clean-up old files to make sure that new ones won’t break them
	NSFileManager *fm = [NSFileManager defaultManager];
	for (ZKCDHeader *cdHeader in archive.centralDirectory) {
		NSString *fullPath = [CACHEPATH stringByAppendingPathComponent:cdHeader.filename];
		[fm removeItemAtPath:fullPath error:nil];
	}
	
	NSInteger result = [archive inflateToDirectory:CACHEPATH usingResourceFork:NO];
	if (result != zkSucceeded) {
		TRACE(@"ERROR UNPACKING ENGINE!!!");
	}
}

- (void)viewDidLoad
{
    [super viewDidLoad];
	
	[self unpackEngine];
	
	self.webview.delegate = self;
	self.webview.dataDetectorTypes = UIDataDetectorTypeNone;
	self.webview.scrollView.scrollEnabled = NO;


	NSString *mainFile = [CACHEPATH stringByAppendingPathComponent:@"index.html"];
	if (mainFile) {
		NSURLRequest *req = [NSURLRequest requestWithURL:[NSURL fileURLWithPath:mainFile]];
		[self.webview loadRequest:req];
	}
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)viewDidUnload {
    [self setWebview:nil];
    [super viewDidUnload];
}

- (BOOL)           webView:(UIWebView *)webView
shouldStartLoadWithRequest:(NSURLRequest *)request
			navigationType:(UIWebViewNavigationType)navigationType {
	
	NSURL *url = [request URL];
	if (![url isFileURL] && navigationType == UIWebViewNavigationTypeLinkClicked) {
		if (![[UIApplication sharedApplication] openURL:url]) {
			TRACE(@"%@%@",@"Failed to open url:",[url description]);
		}
		
		return NO;
	}
	
	return YES;
}

@end
