import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  ScrollView,
  Animated,
  Dimensions,
  TextInput
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/Theme';

// Mock receipt data that would be obtained from OCR processing
const mockReceiptData = {
  merchant: "GROCERY MARKET",
  date: new Date(),
  total: 43.27,
  items: [
    { name: "Organic Apples", price: 4.99, quantity: 1, category: "food" },
    { name: "Whole Wheat Bread", price: 3.49, quantity: 1, category: "food" },
    { name: "Milk 2%", price: 2.99, quantity: 1, category: "food" },
    { name: "Eggs Large", price: 5.49, quantity: 1, category: "food" },
    { name: "Chicken Breast", price: 12.99, quantity: 1, category: "food" },
    { name: "Spinach", price: 3.99, quantity: 1, category: "food" },
    { name: "Pasta", price: 1.99, quantity: 2, category: "food" },
    { name: "Yogurt", price: 4.99, quantity: 1, category: "food" },
  ],
  taxAmount: 2.35,
};

// Placeholder receipt image
const mockReceiptImage = "https://media.istockphoto.com/id/1451567695/photo/grocery-receipt-food-cost-inflation-expense-shopping-supermarket-price-bill-paper-payment.jpg?s=612x612&w=0&k=20&c=_p_F4JXF_d-_8CWFDXOVfT8pJMCaWKQlh6dTojCFrsc=";

export default function ScanReceiptScreen() {
  const router = useRouter();
  const [scanStage, setScanStage] = useState<'intro' | 'camera' | 'scanning' | 'results'>('intro');
  const [receiptData, setReceiptData] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [editedData, setEditedData] = useState<any>(null);
  
  // Animation refs
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const scanProgressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scanStage === 'scanning') {
      // Animated scan line
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Scan progress animation
      Animated.timing(scanProgressAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start();
      
      // Simulate receipt processing
      const timeout = setTimeout(() => {
        setScanStage('results');
        setReceiptData(mockReceiptData);
        setSelectedItems(mockReceiptData.items);
        setEditedData({
          merchant: mockReceiptData.merchant,
          date: mockReceiptData.date,
          category: "food",
          total: mockReceiptData.total,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 3000);
      
      return () => {
        clearTimeout(timeout);
        scanLineAnim.stopAnimation();
        scanProgressAnim.stopAnimation();
      };
    }
  }, [scanStage, scanLineAnim, scanProgressAnim]);
  
  const handleStartScan = () => {
    setScanStage('camera');
  };
  
  const handleTakePhoto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScanStage('scanning');
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Here you would save the receipt data
    console.log('Saving receipt:', {
      ...editedData,
      items: selectedItems
    });
    router.back();
  };
  
  const toggleItemSelection = (item: any) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
    
    // Update total based on selected items
    const newTotal = selectedItems
      .filter(i => i !== item) // Remove this item if it was selected
      .concat(selectedItems.includes(item) ? [] : [item]) // Add it if it wasn't
      .reduce((sum, i) => sum + (i.price * i.quantity), 0);
    
    setEditedData({
      ...editedData,
      total: newTotal
    });
  };
  
  const renderIntroState = () => (
    <View style={styles.centeredContainer}>
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionTitle}>Scan Receipt</Text>
        <Text style={styles.instructionText}>
          Take a photo of your receipt to automatically add the expense.
        </Text>
      </View>
      
      <View style={styles.receiptIllustration}>
        <Ionicons name="receipt-outline" size={100} color={Colors.primary} />
        <View style={styles.scanIcon}>
          <Ionicons name="scan-outline" size={24} color={Colors.accent} />
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStartScan}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>Start Scanning</Text>
      </TouchableOpacity>
      
      <View style={styles.tipContainer}>
        <Ionicons name="bulb-outline" size={16} color={Colors.primary} />
        <Text style={styles.tipText}>
          Ensure good lighting and place the receipt on a flat surface for best results.
        </Text>
      </View>
    </View>
  );
  
  const renderCameraState = () => (
    <View style={styles.cameraContainer}>
      {/* This would be a camera view in a real app */}
      <View style={styles.cameraMock}>
        <View style={styles.receiptGuide}>
          <Text style={styles.cameraInstructionText}>
            Position the receipt within the frame
          </Text>
        </View>
      </View>
      
      <View style={styles.cameraControls}>
        <TouchableOpacity style={styles.cameraButton} onPress={handleCancel}>
          <Ionicons name="close" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cameraButton}>
          <Ionicons name="flash" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderScanningState = () => (
    <View style={styles.scanningContainer}>
      <View style={styles.scanningImageContainer}>
        <Image
          source={{ uri: mockReceiptImage }}
          style={styles.receiptImage}
          resizeMode="cover"
        />
        <Animated.View
          style={[
            styles.scanLine,
            {
              transform: [
                {
                  translateY: scanLineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 400],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
      
      <View style={styles.scanningProgressContainer}>
        <Text style={styles.scanningText}>Processing Receipt...</Text>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: scanProgressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <View style={styles.processingSteps}>
          <Animated.Text
            style={[
              styles.processingStepText,
              {
                opacity: scanProgressAnim.interpolate({
                  inputRange: [0, 0.3, 0.4],
                  outputRange: [1, 1, 0],
                }),
              },
            ]}
          >
            Identifying receipt...
          </Animated.Text>
          <Animated.Text
            style={[
              styles.processingStepText,
              {
                opacity: scanProgressAnim.interpolate({
                  inputRange: [0.3, 0.4, 0.7, 0.8],
                  outputRange: [0, 1, 1, 0],
                }),
              },
            ]}
          >
            Extracting items and prices...
          </Animated.Text>
          <Animated.Text
            style={[
              styles.processingStepText,
              {
                opacity: scanProgressAnim.interpolate({
                  inputRange: [0.7, 0.8, 1],
                  outputRange: [0, 1, 1],
                }),
              },
            ]}
          >
            Categorizing items...
          </Animated.Text>
        </View>
      </View>
    </View>
  );
  
  const renderResultsState = () => (
    <View style={styles.resultsContainer}>
      <ScrollView
        style={styles.resultsScrollView}
        contentContainerStyle={styles.resultsContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Receipt Image</Text>
          <View style={styles.receiptImageContainer}>
            <Image
              source={{ uri: mockReceiptImage }}
              style={styles.resultReceiptImage}
              resizeMode="cover"
            />
            <View style={styles.aiDetectedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text style={styles.aiDetectedText}>AI Processed</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Receipt Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Merchant</Text>
              <TextInput
                style={styles.textInput}
                value={editedData?.merchant}
                onChangeText={(text) =>
                  setEditedData({ ...editedData, merchant: text })
                }
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.textInput}
                value={editedData?.date.toLocaleDateString()}
                editable={false}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categorySelector}>
                {['food', 'shopping', 'health', 'other'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      editedData?.category === cat && styles.categoryOptionSelected,
                    ]}
                    onPress={() => setEditedData({ ...editedData, category: cat })}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        editedData?.category === cat && styles.categoryTextSelected,
                      ]}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Total Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={editedData?.total.toFixed(2)}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, total: parseFloat(text) || 0 })
                  }
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.resultSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Detected Items</Text>
            <Text style={styles.itemsSubtitle}>Tap to select items to include</Text>
          </View>
          
          <View style={styles.itemsCard}>
            {receiptData?.items.map((item: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.itemRow,
                  selectedItems.includes(item) && styles.selectedItemRow,
                ]}
                onPress={() => toggleItemSelection(item)}
                activeOpacity={0.7}
              >
                <View style={styles.itemCheckbox}>
                  {selectedItems.includes(item) && (
                    <Ionicons name="checkmark" size={16} color={Colors.primary} />
                  )}
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
              </TouchableOpacity>
            ))}
            
            <View style={styles.taxRow}>
              <Text style={styles.taxLabel}>Tax</Text>
              <Text style={styles.taxAmount}>${receiptData?.taxAmount.toFixed(2)}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>${editedData?.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <BlurView intensity={90} style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Save Receipt</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Scan Receipt',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.background },
          headerShown: scanStage !== 'camera',
          headerLeft: () => (
            <TouchableOpacity onPress={handleCancel} style={{ padding: 8 }}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      {scanStage === 'intro' && renderIntroState()}
      {scanStage === 'camera' && renderCameraState()}
      {scanStage === 'scanning' && renderScanningState()}
      {scanStage === 'results' && renderResultsState()}
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  instructionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.m,
  },
  instructionText: {
    fontSize: FontSize.m,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  receiptIllustration: {
    position: 'relative',
    marginBottom: Spacing.xl,
  },
  scanIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.accent + '30',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.m,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.xl,
    ...Shadow.medium,
  },
  startButtonText: {
    fontSize: FontSize.m,
    fontWeight: '600',
    color: '#fff',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    marginTop: Spacing.xl,
    maxWidth: 300,
  },
  tipText: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
    marginLeft: Spacing.s,
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraMock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  receiptGuide: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.s,
    width: width * 0.7,
    height: height * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.m,
  },
  cameraInstructionText: {
    color: '#fff',
    fontSize: FontSize.m,
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: BorderRadius.s,
    padding: Spacing.s,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: '#000',
  },
  cameraButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#000',
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.danger,
  },
  scanningContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scanningImageContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'relative',
  },
  receiptImage: {
    width: '100%',
    height: '100%',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  scanningProgressContainer: {
    padding: Spacing.m,
    alignItems: 'center',
  },
  scanningText: {
    fontSize: FontSize.l,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginVertical: Spacing.m,
  },
  progressBarContainer: {
    width: '80%',
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.m,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  processingSteps: {
    alignItems: 'center',
    marginTop: Spacing.s,
  },
  processingStepText: {
    fontSize: FontSize.m,
    color: Colors.textSecondary,
    marginVertical: 4,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  resultsScrollView: {
    flex: 1,
  },
  resultsContent: {
    paddingBottom: 100,
  },
  resultSection: {
    marginBottom: Spacing.l,
    paddingHorizontal: Spacing.m,
  },
  sectionTitle: {
    fontSize: FontSize.l,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginVertical: Spacing.s,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginVertical: Spacing.s,
  },
  itemsSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  receiptImageContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    overflow: 'hidden',
    ...Shadow.small,
    position: 'relative',
  },
  resultReceiptImage: {
    width: '100%',
    height: 200,
  },
  aiDetectedBadge: {
    position: 'absolute',
    top: Spacing.s,
    right: Spacing.s,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.l,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  aiDetectedText: {
    color: '#fff',
    fontSize: FontSize.xs,
    fontWeight: '500',
    marginLeft: 4,
  },
  detailsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    ...Shadow.small,
  },
  inputGroup: {
    marginBottom: Spacing.m,
  },
  inputLabel: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.s,
    padding: Spacing.s,
    fontSize: FontSize.m,
    color: Colors.textPrimary,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.s,
    padding: Spacing.s,
  },
  currencySymbol: {
    fontSize: FontSize.l,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: FontSize.l,
    fontWeight: '500',
    color: Colors.textPrimary,
    padding: 0,
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryOption: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.s,
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.m,
    margin: 4,
  },
  categoryOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: FontSize.s,
    color: Colors.textPrimary,
  },
  categoryTextSelected: {
    color: '#fff',
  },
  itemsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    ...Shadow.small,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedItemRow: {
    backgroundColor: Colors.primary + '10',
  },
  itemCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
  },
  itemDetails: {
    flex: 1,
    marginRight: Spacing.s,
  },
  itemName: {
    fontSize: FontSize.m,
    color: Colors.textPrimary,
  },
  itemQuantity: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  itemPrice: {
    fontSize: FontSize.m,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  taxLabel: {
    fontSize: FontSize.m,
    color: Colors.textSecondary,
  },
  taxAmount: {
    fontSize: FontSize.m,
    color: Colors.textSecondary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.s,
    marginTop: Spacing.s,
  },
  totalLabel: {
    fontSize: FontSize.l,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalAmount: {
    fontSize: FontSize.l,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: Spacing.m,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.s,
    padding: Spacing.m,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: FontSize.m,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  confirmButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.s,
    padding: Spacing.m,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: FontSize.m,
    fontWeight: '500',
    color: '#fff',
  },
});
