//
//  IPViewController.h
//  iPhones News
//
//  Created by Sergey Chikuyonok on 3/19/13.
//  Copyright (c) 2013 Sergey Chikuyonok. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "GAI.h"

@interface IPViewController : UIViewController <UIWebViewDelegate, UIAlertViewDelegate>
@property (strong, nonatomic) IBOutlet UIWebView *webview;
@property(nonatomic, retain) id<GAITracker> tracker;

@end
