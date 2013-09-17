//
//  IPViewController.h
//  iNews76
//
//  Created by Sergey Chikuyonok on 3/19/13.
//  Copyright (c) 2013 Sergey Chikuyonok. All rights reserved.
//

#import "GAI.h"

@interface IPViewController : UIViewController <UIWebViewDelegate, UIAlertViewDelegate> {
	UIWebView *mWebView;
	__weak UIImageView *splashView;
	__strong NSString *CACHEPATH;
}

@property (nonatomic, strong) id<GAITracker> tracker;

@end
