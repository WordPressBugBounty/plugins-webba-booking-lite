<?php
// Webba Booking business hours management class
// check if accessed directly
if ( ! defined( 'ABSPATH' ) ) exit;
class WBK_Business_Hours {
	// monday business hours;
	protected $monday_business_hours;
	// tuesday business hours;
	protected $tuesday_business_hours;
	// wednesday business hours;
	protected $wednesday_business_hours;
	// thursday business hours;
	protected $thursday_business_hours;
	// friday business hours;
	protected $friday_business_hours;
	// saturday business hours;
	protected $saturday_business_hours;
	// sunday business hours;
	public $sunday_business_hours;
	// workday monday
	public $monday_workday;
	// workday tuesday
	public $tuesday_workday;
	// workday wednesday
	public $wednesday_workday;
	// workday thursday
	public $thursday_workday;
	// workday friday
	public $friday_workday;
	// workday saturday
	public $saturday_workday;
	// workday sunday
	public $sunday_workday;

	public function __construct() {
		$this->monday_business_hours    = array();
		$this->tuesday_business_hours   = array();
		$this->wednesday_business_hours = array();
		$this->thursday_business_hours  = array();
		$this->friday_business_hours    = array();
		$this->saturday_business_hours  = array();
		$this->sunday_business_hours    = array();

	}
	// set default
	public function setDefault () {
		$this->monday_business_hours    = array( 32402, 46802, 50402, 64802 );
		$this->tuesday_business_hours  = array( 32402, 46802, 50402, 64802 );
		$this->wednesday_business_hours = array( 32402, 46802, 50402, 64802 );
		$this->thursday_business_hours  = array( 32402, 46802, 50402, 64802 );
		$this->friday_business_hours    = array( 32402, 46802, 50402, 64802 );
		$this->saturday_business_hours  = array( 32402, 46802, 50402, 64802 );
		$this->sunday_business_hours    = array( 32402, 46802, 50402, 64802 );

		$this->monday_workday = true;
		$this->tuesday_workday = true;
		$this->wednesday_workday = true;
		$this->thursday_workday = true;
		$this->friday_workday = true;
		$this->saturday_workday = false;
		$this->sunday_workday = false;
	}
	// set default with all days off
	public function setDefaultAllOff () {
		$this->monday_business_hours    = array( 32402, 46802, 50402, 64802 );
		$this->tuesday_business_hours  = array( 32402, 46802, 50402, 64802 );
		$this->wednesday_business_hours = array( 32402, 46802, 50402, 64802 );
		$this->thursday_business_hours  = array( 32402, 46802, 50402, 64802 );
		$this->friday_business_hours    = array( 32402, 46802, 50402, 64802 );
		$this->saturday_business_hours  = array( 32402, 46802, 50402, 64802 );
		$this->sunday_business_hours    = array( 32402, 46802, 50402, 64802 );

		$this->monday_workday = false;
		$this->tuesday_workday = false;
		$this->wednesday_workday = false;
		$this->thursday_workday = false;
		$this->friday_workday = false;
		$this->saturday_workday = false;
		$this->sunday_workday = false;
	}
	// constuct object from an array
	public function setFromArray ( $arr ) {
		$this->setDefaultAllOff();
		$curIntValue = -1;
		$mode = '';
		$day_number = 1;

		foreach ( $arr as $item ) {

			// check 0 / 1 and get name of day
			if ( $item == '1' ) {
				if ( $day_number > 7 ) {
					return false;
				}
				$item = $this->getDayName( $day_number );

				$working = true;
				$day_number++;
			} elseif ( $item == '0' ) {
				if ( $day_number > 7 ) {
					return false;
				}
				$item = $this->getDayName( $day_number );

				$working = false;
				$day_number++;
			}
			// set mode

			if ( $item == 'monday' ) {
				if ( $curIntValue <> -1 && $curIntValue <> 2  &&  $curIntValue <> 4 ) {
					return false;
				}
				$this->monday_workday = $working;
				$mode = 'set_monday';
				$this->monday_business_hours = array();
				$curIntValue = 0;

				continue;
			}

			if ( $item == 'tuesday' ) {

				if ( $curIntValue <> -1 && $curIntValue <> 2  &&  $curIntValue <> 4 ) {
					return false;
				}
				$this->tuesday_workday = $working;
				$mode = 'set_tuesday';
				$this->tuesday_business_hours = array();
				$curIntValue = 0;
				continue;
			}
			if ( $item == 'wednesday' ) {
				if ( $curIntValue <> -1 && $curIntValue <> 2  &&  $curIntValue <> 4 ) {
					return false;
				}
				$this->wednesday_workday = $working;
				$mode = 'set_wednesday';
				$this->wednesday_business_hours = array();
				$curIntValue = 0;

				continue;
			}
			if ( $item == 'thursday' ) {
				if ( $curIntValue <> -1 && $curIntValue <> 2  &&  $curIntValue <> 4 ) {
					return false;
				}
				$this->thursday_workday = $working;
				$mode = 'set_thursday';
				$this->thursday_business_hours = array();
				$curIntValue = 0;

				continue;
			}
			if ( $item == 'friday' ) {
				if ( $curIntValue <> -1 && $curIntValue <> 2  &&  $curIntValue <> 4 ) {
					return false;
				}
				$this->friday_workday = $working;
				$mode = 'set_friday';
				$this->friday_business_hours = array();
				$curIntValue = 0;

				continue;
			}
			if ( $item == 'saturday' ) {
				if ( $curIntValue <> -1 && $curIntValue <> 2  &&  $curIntValue <> 4 ) {
					return false;
				}
				$this->saturday_workday = $working;
				$mode = 'set_saturday';
				$this->saturday_business_hours = array();
				$curIntValue = 0;

				continue;
			}
			if ( $item == 'sunday' ) {
				if ( $curIntValue <> -1 && $curIntValue <> 2  &&  $curIntValue <> 4 ) {
					return false;
				}
				$this->sunday_workday = $working;
				$mode = 'set_sunday';
				$this->sunday_business_hours = array();
				$curIntValue = 0;

				continue;
			}
			if ( $mode == '' ) {
				return false;
			}
			// check interval item
			if ( !WBK_Validator::check_integer( $item, 2, 86402 ) ) {
 				return false;
 			}
			// set interval
			if ( $mode == 'set_monday' ) {
				array_push( $this->monday_business_hours, $item );
				$curIntValue++;

				continue;
			}

			if ( $mode == 'set_tuesday' ) {
				array_push( $this->tuesday_business_hours, $item );

				$curIntValue++;
				continue;
			}
			if ( $mode == 'set_wednesday' ) {
				array_push( $this->wednesday_business_hours, $item );

				$curIntValue++;
				continue;
			}
			if ( $mode == 'set_thursday' ) {
				array_push( $this->thursday_business_hours, $item );
				$curIntValue++;

				continue;
			}
			if ( $mode == 'set_friday' ) {
				array_push( $this->friday_business_hours, $item );
				$curIntValue++;

				continue;
			}
			if ( $mode == 'set_saturday' ) {
				array_push( $this->saturday_business_hours, $item );
				$curIntValue++;

				continue;
			}
			if ( $mode == 'set_sunday' ) {
				array_push( $this->sunday_business_hours, $item );
 				$curIntValue++;

				continue;
			}

		}
		if ( $curIntValue <> 2 && $curIntValue <> 4 ) {
			return false;
		}
		return true;
	}
	// load from wp options
	public function load( $str_business_hours ) {
 		$arr = explode( ';', $str_business_hours );
 		if ( is_array( $arr ) ) {
			$this->setFromArray( $arr );
 		} else {
 			$this->setDefault();
 		}
	}
	// get count of time interval for day
	public function	getIntervalCount ( $day ) {
		if ( $day == 'monday' ) {
			if ( count( $this->monday_business_hours ) == 4 ) {
				return 2;
			}
			return 1;
		}
		if ( $day == 'tuesday' ) {
			if ( count( $this->tuesday_business_hours ) == 4 ) {
				return 2;
			}
			return 1;
		}
		if ( $day == 'wednesday' ) {
			if ( count( $this->wednesday_business_hours ) == 4 ) {
				return 2;
			}
			return 1;
		}
		if ( $day == 'thursday' ) {
			if ( count( $this->thursday_business_hours ) == 4 ) {
				return 2;
			}
			return 1;
		}
		if ( $day == 'friday' ) {
			if ( count( $this->friday_business_hours ) == 4 ) {
				return 2;
			}
			return 1;
		}
		if ( $day == 'saturday' ) {
			if ( count( $this->saturday_business_hours ) == 4 ) {
				return 2;
			}
			return 1;
		}
		if ( $day == 'sunday' ) {
			if ( count( $this->sunday_business_hours ) == 4 ) {
				return 2;
			}
			return 1;
		}
	}
	// get full interval
	public function getFullInterval ( $day ) {
		if ( $this->getIntervalCount( $day ) == 1 ){
			$interval = $this->getInterval( $day, 1 );
			return $interval;

		} else {
			$interval1 = $this->getInterval( $day, 1 );
			$interval2 = $this->getInterval( $day, 2 );
			$result = array ( $interval1[0], $interval2[1] );
			return $result;
		}
	}
	// get time interval for day
	public function getInterval ( $day, $n ) {
		$result = array();
		if ( $day == 'monday' ) {
			if ( $n == 1 ) {
				$result = array ( $this->monday_business_hours[0], $this->monday_business_hours[1]  );
			} elseif ( $n == 2 ) {
				$result = array ( $this->monday_business_hours[2], $this->monday_business_hours[3]  );
			}
		}
		if ( $day == 'tuesday' ) {
			if ( $n == 1 ) {
				$result = array ( $this->tuesday_business_hours[0], $this->tuesday_business_hours[1]  );
			} elseif ( $n == 2 ) {
				$result = array ( $this->tuesday_business_hours[2], $this->tuesday_business_hours[3]  );
			}
		}
		if ( $day == 'wednesday' ) {
			if ( $n == 1 ) {
				$result = array ( $this->wednesday_business_hours[0], $this->wednesday_business_hours[1]  );
			} elseif ( $n == 2 ) {
				$result = array ( $this->wednesday_business_hours[2], $this->wednesday_business_hours[3]  );
			}
		}
		if ( $day == 'thursday' ) {
			if ( $n == 1 ) {
				$result = array ( $this->thursday_business_hours[0], $this->thursday_business_hours[1]  );
			} elseif ( $n == 2 ) {
				$result = array ( $this->thursday_business_hours[2], $this->thursday_business_hours[3]  );
			}
		}
		if ( $day == 'friday' ) {
			if ( $n == 1 ) {
				$result = array ( $this->friday_business_hours[0], $this->friday_business_hours[1]  );
			} elseif ( $n == 2 ) {
				$result = array ( $this->friday_business_hours[2], $this->friday_business_hours[3]  );
			}
		}
		if ( $day == 'saturday' ) {
			if ( $n == 1 ) {
				$result = array ( $this->saturday_business_hours[0], $this->saturday_business_hours[1]  );
			} elseif ( $n == 2 ) {
				$result = array ( $this->saturday_business_hours[2], $this->saturday_business_hours[3]  );
			}
		}
		if ( $day == 'sunday' ) {
			if ( $n == 1 ) {
				$result = array ( $this->sunday_business_hours[0], $this->sunday_business_hours[1]  );
			} elseif ( $n == 2 ) {
				$result = array ( $this->sunday_business_hours[2], $this->sunday_business_hours[3]  );
			}
		}

		return $result;
	}
	// convert day number to day name
	public function getDayName( $n ) {
		switch ( $n) {
			case 1:
				return 'monday';
				break;
			case 2:
				return 'tuesday';
				break;
			case 3:
				return 'wednesday';
				break;
			case 4:
				return 'thursday';
				break;
			case 5:
				return 'friday';
				break;
			case 6:
				return 'saturday';
				break;
			case 7:
				return 'sunday';
				break;

			default:
				return 'monday';
				break;
		}
	}
	// convert day number to day name with translation
	public function getDayNameTranslated( $n ) {
		switch ( $n) {
			case 1:
				return __( 'Monday', 'webba-booking-lite' );
				break;
			case 2:
				return __( 'Tuesday', 'webba-booking-lite' );
				break;
			case 3:
				return __( 'Wednesday', 'webba-booking-lite' );
				break;
			case 4:
				return __( 'Thursday', 'webba-booking-lite' );
				break;
			case 5:
				return __( 'Friday', 'webba-booking-lite' );
				break;
			case 6:
				return __( 'Saturday', 'webba-booking-lite' );
				break;
			case 7:
				return __( 'Sunday', 'webba-booking-lite' );;
				break;

			default:
				return __( 'Monday', 'webba-booking-lite' );;
				break;
		}
	}
	// check if day is working
	public function isWorkday ( $day ) {
		if ( $day == 'monday' ) {
			return $this->monday_workday;
		}
		if ( $day == 'tuesday' ) {
			return $this->tuesday_workday;
		}

		if ( $day == 'wednesday' ) {
			return $this->wednesday_workday;
		}
		if ( $day == 'thursday' ) {
			return $this->thursday_workday;
		}
		if ( $day == 'friday' ) {
			return $this->friday_workday;
		}

		if ( $day == 'saturday' ) {
			return $this->saturday_workday;
		}
		if ( $day == 'sunday' ) {
			return $this->sunday_workday;
		}

	}
	// check if day is working by timestamp
	public function isWorkdayTime ( $time ) {
		$day_of_week = strtolower( date( 'l', $time ) );
		return $this->isWorkday( $day_of_week );
	}
	// check if day is holyday
	public function checkIfHolyday( $day ){
		$holydays = get_option( 'wbk_holydays' );
		$arr = explode( ',', $holydays );
		foreach ( $arr as $item ) {
			$holyday = strtotime( $item );
			if ( $holyday == $day ) {
				return apply_filters( 'wbk_check_holiday', true );
			}
			if( get_option( 'wbk_recurring_holidays', '' ) == 'true' ){
				$holyday_m = date( 'm', $holyday );
				$holyday_d = date( 'd', $holyday );
				$holyday_y = date( 'y', $holyday );
				$current_y = date( 'y', $day );
			 	$holyday =  strtotime( 	$holyday_m . '/' . $holyday_d . '/' . $current_y  );
				if ( $holyday == $day ) {
					return apply_filters( 'wbk_check_holiday', true );
				}
			}
		}

		return apply_filters( 'wbk_check_holiday', false );

	}
	// get business hours by timestamp
	public function getBusinessHours( $day ){
		$day_of_week = strtolower( date( 'l', $day ) );
		if ( $day_of_week == 'monday' ) {
			$result = $this->monday_business_hours;
		}
		if ( $day_of_week == 'tuesday' ) {
			$result =  $this->tuesday_business_hours;
		}
		if ( $day_of_week == 'wednesday' ) {
			$result =  $this->wednesday_business_hours;
		}
		if ( $day_of_week == 'thursday' ) {
			$result =  $this->thursday_business_hours;
		}
		if ( $day_of_week == 'friday' ) {
			$result =  $this->friday_business_hours;
		}
		if ( $day_of_week == 'saturday' ) {
			$result =  $this->saturday_business_hours;
		}
		if ( $day_of_week == 'sunday' ) {
			$result = $this->sunday_business_hours;
		}
		return apply_filters( 'wbk_business_hours', $result, $day, array( $this->monday_business_hours,
																		  $this->tuesday_business_hours,
																		  $this->wednesday_business_hours,
																		  $this->thursday_business_hours,
																		  $this->friday_business_hours,
																		  $this->saturday_business_hours,
																		  $this->sunday_business_hours ) );
	}
	// get array of day of week (number) unlocked manualy
	public function getLockedDaysOfWeek( $service_id ) {
		global $wpdb;
		$time_yesterday = strtotime( 'yesterday' );
		$days = $wpdb->get_col( $wpdb->prepare(
			"
				SELECT day
				FROM " . get_option( 'wbk_db_prefix', '' ) . "wbk_days_on_off
				where service_id = %d AND day > %d  AND status = 1
			",
			$service_id, $time_yesterday
		));
		$result = array();

		$timezone = get_option( 'wbk_timezone', 'UTC' );
		date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        if ( $timezone != '' ){
            date_default_timezone_set( $timezone );
        }
		foreach ( $days as $day ) {
 			$day_number = date( 'N', $day );
 			array_push( $result, $day_number );
 		}
		date_default_timezone_set( 'UTC' );

 		$result = array_unique( $result );
 		return $result;
	}


}
?>
